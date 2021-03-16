import fs from 'fs';
import { Request, Response } from 'express';

/**
 * Stream files
 */
interface IndexRequestInterface extends Request {
  params: {
    path: string;
  };
}
const index = async (
  request: IndexRequestInterface,
  response: Response
) => {
  
  const { path } = request.params;
  
  const readStream = fs.createReadStream(`tmp/uploads/${path}`);

  readStream.on('open', () => {
    readStream.pipe(response);
  });

  readStream.on('error', () => {
    response.status(404).end();
  });
  
};

export default {
  index
}