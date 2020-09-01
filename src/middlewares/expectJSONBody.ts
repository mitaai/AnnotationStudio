import { NextApiResponse, NextApiRequest } from 'next';
import { Middleware } from 'next-connect';

/**
 * Middleware accepting exclusively valid JSON as req.body, if existing
 * This utility courtesy of Gerrit Alex (@ljosberinn)
 * From @ljosberinn/personal-react-boilerplate on GitHub
 * Released under MIT License, 2020
 */

export const expectJSONBodyMiddleware: Middleware<NextApiRequest, NextApiResponse> = (req, res, next) => {
  if (req.body.length > 0) {
    try {
      const body = JSON.parse(req.body);

      if (!(body instanceof Object)) {
        return res.status(400).end();
      }

      req.body = body;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return res.status(400).end();
    }
  }

  next();
};