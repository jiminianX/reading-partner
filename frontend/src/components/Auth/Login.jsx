import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signUp } from '../../services/firebase';
import Logo from '../Common/Logo';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = isSignup
            ? await signUp(email, password)
            : await signIn(email, password);

        if (result.success) {
            navigate('/app');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <Logo size={100} className="login-logo" />
                <h1>Reading Partner</h1>
                <p>Reading and Research Assistant</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isSignup ? "Create a password (min 6 characters)" : "Enter your password"}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
                    </button>

                    <div className="auth-toggle">
                        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <a onClick={() => setIsSignup(!isSignup)}>
                            {isSignup ? 'Login' : 'Sign up'}
                        </a>
                    </div>
                </form>

                <div className="back-to-home">
                    <Link to="/">&larr; Back to home</Link>
                </div>
            </div>
        </div>
    );
}
