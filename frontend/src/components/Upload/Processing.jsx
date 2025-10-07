import './Processing.css';

export default function Processing({ text = 'Processing your document...' }) {
    return (
        <div className="processing">
            <div className="book">
                <div className="book__pg-shadow"></div>
                <div className="book__pg"></div>
                <div className="book__pg book__pg--2"></div>
                <div className="book__pg book__pg--3"></div>
                <div className="book__pg book__pg--4"></div>
                <div className="book__pg book__pg--5"></div>
            </div>
            <div className="processing-text">{text}</div>
        </div>
    );
}
