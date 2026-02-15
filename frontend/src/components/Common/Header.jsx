import { signOut } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggleButton, useThemeTransition } from './ThemeToggleButton';
import './Header.css';

export default function Header({ onReflect }) {
    const { currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { startTransition } = useThemeTransition();

    const handleLogout = async () => {
        await signOut();
    };

    const handleThemeToggle = () => {
        startTransition(() => {
            toggleTheme();
        });
    };

    const userName = currentUser?.email?.split('@')[0] || 'Reader';

    return (
        <div className="header">
            <h1>Reading Partner</h1>
            <div className="user-info">
                <ThemeToggleButton
                    theme={theme}
                    variant="circle"
                    start="top-right"
                    onClick={handleThemeToggle}
                />
                <span className="user-name">{userName}</span>
                {onReflect && (
                    <button className="btn btn-secondary btn-small" onClick={onReflect}>
                        Reflect
                    </button>
                )}
                <button className="btn btn-secondary btn-small" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}