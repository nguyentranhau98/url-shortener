import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import process from 'process';
import * as urlService from './urls.services';

/**
 * Create a short url from the long input url.
 * @param {Request} req - The upcoming request param.
 * @param {Response} res - The returning response param.
 * @return {Response} - The response of the request.
 */
export async function shortenUrl(req: Request, res: Response) {
    try {
        const originalUrl = req.body.url;
        const baseUrl = getBaseUrl(req);
        const result = await urlService.shortenUrl(originalUrl, baseUrl);
        return res.status(StatusCodes.OK).json({
            message: result,
        });
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: error.message,
        });
    }
}

/**
 * Access the original url using the shortened url.
 * @param {Request} req - The upcoming request param.
 * @param {Response} res - The returning response param.
 * @return {Response} - The response of the request.
 */
export async function getShortenUrl(req: Request, res: Response) {
    try {
        const uniqueCode = req.params.uniqueCode;
        const url = await urlService.getUrl(uniqueCode);
        const maximumAccess = process.env.MAXIMUM_ACCESS
            ? process.env.MAXIMUM_ACCESS
            : 10;
        if (url) {
            let { clickCount } = url;
            if (clickCount > maximumAccess) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'Maximum',
                });
            }
            clickCount++;
            await urlService.updateCount(url, clickCount);
            return res.redirect(url.originalUrl);
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Not existed',
            });
        }
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: error.message,
        });
    }
}

/**
 * Get the base url, will return the config localhost url if running at localhost,
 * otherwise return the base url of the server.
 * @param {Request} req - The request used to retrieve the base url.
 * @return {string} - The base url.
 */
function getBaseUrl(req: Request) {
    const hostname
        = req.hostname === 'localhost'
            ? process.env.LOCAL_HOSTNAME
            : req.hostname;
    return `${hostname}${req.originalUrl}`;
}
