import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggleButton, useThemeTransition } from '../Common/ThemeToggleButton';
import Logo from '../Common/Logo';
import useScrollReveal from '../../hooks/useScrollReveal';
import './LandingPage.css';

const features = [
    {
        number: '01',
        title: 'PDF Rendering',
        description:
            'High-fidelity canvas rendering with a text layer overlay. Select, search, and interact with your documents exactly as intended.',
    },
    {
        number: '02',
        title: 'Smart Highlights & Notes',
        description:
            'Color-coded highlights with contextual notes. Organize your thoughts alongside the text that inspired them.',
    },
    {
        number: '03',
        title: 'AI-Powered Questions',
        description:
            'Generate comprehension questions from your reading material. Test your understanding and deepen your engagement with the text.',
    },
];

function FeatureCard({ number, title, description, delay }) {
    const { ref, isVisible } = useScrollReveal();

    return (
        <div
            ref={ref}
            className={`feature-card ${isVisible ? 'revealed' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <span className="feature-number">{number}</span>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
        </div>
    );
}

function CTASection() {
    const { ref, isVisible } = useScrollReveal();

    return (
        <section ref={ref} className={`cta-section ${isVisible ? 'revealed' : ''}`}>
            <div className="cta-rule" />
            <h2 className="cta-heading">Start reading with purpose</h2>
            <p className="cta-subtitle">
                Upload a document, highlight what matters, and let AI help you understand it deeply.
            </p>
            <Link to="/login" className="btn cta-btn">
                Get Started
            </Link>
        </section>
    );
}

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();
    const { startTransition } = useThemeTransition();

    const handleThemeToggle = () => {
        startTransition(() => {
            toggleTheme();
        });
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <Link to="/" className="landing-logo">
                        <Logo size={32} />
                        <span className="landing-logo-text">Reading Partner</span>
                    </Link>
                    <div className="landing-nav-actions">
                        <ThemeToggleButton
                            theme={theme}
                            onClick={handleThemeToggle}
                        />
                        <Link to="/login" className="btn btn-small">
                            Log In
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-grain" />
                <div className="hero-content">
                    <span className="hero-label">Est. 2025 — Reading & Research</span>
                    <h1 className="hero-title">
                        Your personal<br />reading companion
                    </h1>
                    <p className="hero-subtitle">
                        A warm, focused space for reading, annotating, and understanding.
                        Upload PDFs, highlight key passages, take notes, and generate
                        AI-powered comprehension questions — all in one place.
                    </p>
                    <Link to="/login" className="btn hero-cta">
                        Get Started
                    </Link>
                </div>
            </section>

            <section className="features-section">
                <div className="features-inner">
                    <span className="section-label">Features</span>
                    <div className="features-grid">
                        {features.map((feature, i) => (
                            <FeatureCard
                                key={feature.number}
                                {...feature}
                                delay={i * 100}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <CTASection />

            <footer className="landing-footer">
                <span className="footer-text">Built with care.</span>
            </footer>
        </div>
    );
}
