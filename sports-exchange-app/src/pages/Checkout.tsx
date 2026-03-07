import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Retrieve backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Initialize Stripe (use test key)
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { clearCart } = useCart();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required', // Avoid redirect loop for SPA, handle manually
        });

        if (error) {
            setErrorMessage(error.message ?? 'An unknown error occurred');
        } else {
            clearCart();
            alert('Payment Successful! Order placed.');
            navigate('/');
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-card/60 p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
            <PaymentElement className="my-4" />
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-primary hover:bg-emerald-300 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(19,236,164,0.3)] transition-all disabled:opacity-50"
            >
                <span id="button-text">
                    {isLoading ? <div className="spinner border-2 border-black border-t-transparent animate-spin rounded-full w-5 h-5 mx-auto"></div> : "Pay Now"}
                </span>
            </button>
            {errorMessage && <div className="text-red-400 text-sm">{errorMessage}</div>}
        </form>
    );
};

export const Checkout = () => {
    const { cart, cartTotal } = useCart();
    const { isAuthenticated, token } = useAuth();
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // If cart is empty, redirect
        if (cart.length === 0) {
            navigate('/');
            return;
        }

        // Require Auth
        if (!isAuthenticated) {
            setError('You must be logged in to checkout. (Mocking logic needed inside App.tsx for Auth!)');
            return;
        }

        // Attempt to create payment intent for the first item (multiparts logic will need batch support later)
        // Here we will just purchase the FIRST item in the cart as a test
        const productId = cart[0].id;

        const createPaymentIntent = async () => {
            try {
                const response = await axios.post(`${API_URL}/orders/create-payment-intent`, {
                    productId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setClientSecret(response.data.clientSecret);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to initialize checkout.');
                console.error(err);
            }
        };

        createPaymentIntent();
    }, [cart, isAuthenticated, navigate, token]);

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#13eca4',
            colorBackground: '#16221e',
            colorText: '#ffffff',
        },
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-4xl font-display font-bold mb-8">Secure Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                    <h2 className="text-xl font-bold mb-4 text-primary">Order Summary</h2>
                    <div className="bg-slate-card rounded-2xl p-6 border border-white/5 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div className="flex gap-4">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-xl object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">📦</div>
                                    )}
                                    <div>
                                        <h4 className="font-medium text-white line-clamp-1">{item.title}</h4>
                                        <p className="text-sm text-gray-500">ID: {item.id.substring(0, 8)}...</p>
                                    </div>
                                </div>
                                <div className="font-display font-bold text-white">${item.price.toFixed(2)}</div>
                            </div>
                        ))}

                        <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
                            <span className="text-gray-400">Total Charged</span>
                            <span className="text-3xl font-display font-bold text-primary">${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl">
                            <h3 className="font-bold mb-2">Checkout Error</h3>
                            <p>{error}</p>
                        </div>
                    ) : clientSecret ? (
                        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    ) : (
                        <div className="flex justify-center items-center h-64 bg-slate-card/30 rounded-2xl border border-white/5">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
