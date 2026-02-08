import { useState } from 'react';
import { signIn, signUp } from '../../services/firebase';
import './Login.css';

export default function Login() {
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

        if (!result.success) {
            setError(result.error);
        }
        
        setLoading(false);
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                <img 
                    src="/logo.png" 
                    alt="Reading Partner" 
                    className="login-logo"
                />
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
            </div>
        </div>
    );
}
