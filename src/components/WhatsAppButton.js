import React from 'react';
import PropTypes from 'prop-types';

const WhatsAppButton = ({ phoneNumber }) => {
    const whatsappLink = `https://wa.me/${phoneNumber}`;
    return (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <button className="whatsapp-button">Message Us on WhatsApp</button>
        </a>
    );
};

WhatsAppButton.propTypes = {
    phoneNumber: PropTypes.string.isRequired,
};

export default WhatsAppButton;
