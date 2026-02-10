import Joi from 'joi';

export const githubRepoUrl = Joi.string()
    .uri({ scheme: ['https'] })
    .pattern(
        /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\.git)?$/,
    )
    .required()
    .messages({
        'string.pattern.base':
            'Must be a valid GitHub repository URL (https://github.com/owner/repo)',
        'string.uri': 'GitHub URL must be a valid HTTPS URL',
    });
