import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

const SocialMediaIcons = () => {
  return (
    <div className="flex justify-center space-x-4">
      <a href="https://www.linkedin.com/in/anthony-norderhaug/" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon className="text-blue-900" icon={faLinkedin} size="2x" />
      </a>
      <a href="https://github.com/anorderh" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faGithub} size="2x" />
      </a>
      <a href="https://mail.google.com/mail/?view=cm&fs=1&to=anthony@norderhaug.org" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon className="text-red-500" icon={faGoogle} size="2x" />
      </a>
    </div>
  );
};

export default SocialMediaIcons;