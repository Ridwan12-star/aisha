import React, { useState, useEffect } from 'react';

const WhatsAppFloat = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down 300px
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const handleClick = () => {
        const message = encodeURIComponent("Hello! I'm interested in your products from minimekiddiestreasures.");
        window.open(`https://wa.me/233538232507?text=${message}`, '_blank');
    };

    return (
        <div
            className={`whatsapp-float ${isVisible ? 'visible' : ''}`}
            onClick={handleClick}
            title="Chat on WhatsApp"
        >
            <svg
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                className="whatsapp-icon"
            >
                <path
                    fill="currentColor"
                    d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.050-13.485 13.485-13.485s13.485 6.050 13.485 13.485c0 7.436-6.050 13.486-13.485 13.486zM21.960 18.828c-0.206-0.103-1.216-0.6-1.405-0.669-0.189-0.068-0.326-0.103-0.463 0.103s-0.532 0.669-0.652 0.806c-0.12 0.137-0.24 0.154-0.446 0.051-0.206-0.103-0.869-0.32-1.655-1.021-0.611-0.546-1.024-1.22-1.144-1.426s-0.013-0.317 0.090-0.42c0.093-0.092 0.206-0.24 0.309-0.36s0.137-0.206 0.206-0.343c0.068-0.137 0.034-0.257-0.017-0.36s-0.463-1.117-0.635-1.529c-0.168-0.401-0.338-0.346-0.463-0.352-0.12-0.006-0.257-0.007-0.394-0.007s-0.36 0.051-0.549 0.257c-0.189 0.206-0.721 0.704-0.721 1.717s0.738 1.991 0.841 2.128c0.103 0.137 1.449 2.214 3.51 3.104 0.490 0.212 0.872 0.339 1.170 0.434 0.492 0.157 0.94 0.135 1.293 0.082 0.395-0.059 1.216-0.497 1.388-0.977s0.172-0.892 0.120-0.977c-0.051-0.085-0.189-0.137-0.394-0.24z"
                />
            </svg>
            <span className="whatsapp-text">Chat with us</span>
        </div>
    );
};

export default WhatsAppFloat;
