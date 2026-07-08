/// <reference types="node" />

import { Buffer } from 'node:buffer';
import { createServer, type IncomingHttpHeaders, type IncomingMessage } from 'node:http';
import process from 'node:process';
import { handleTedSbrainMockRequest } from './http';

const host = process.env.MOCK_HOST || '0.0.0.0';
const port = Number(process.env.MOCK_PORT || 49152);

function headersFromIncoming(incomingHeaders: IncomingHttpHeaders): Headers {
  const headers = new Headers();

  Object.entries(incomingHeaders).forEach(([name, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item));
      return;
    }

    if (typeof value === 'string') {
      headers.set(name, value);
    }
  });

  return headers;
}

async function bodyFromIncoming(request: IncomingMessage): Promise<ArrayBuffer | undefined> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks);
  const arrayBuffer = new Uint8Array(body.byteLength);
  arrayBuffer.set(body);

  return arrayBuffer.buffer;
}

const server = createServer(async (incomingRequest, outgoingResponse) => {
  try {
    const requestUrl = new URL(incomingRequest.url || '/', `http://${host}:${port}`);
    const request = new Request(requestUrl, {
      method: incomingRequest.method,
      headers: headersFromIncoming(incomingRequest.headers),
      body: await bodyFromIncoming(incomingRequest),
    });
    const response = await handleTedSbrainMockRequest(request);

    outgoingResponse.statusCode = response.status;
    response.headers.forEach((value, name) => {
      outgoingResponse.setHeader(name, value);
    });
    outgoingResponse.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    outgoingResponse.statusCode = 500;
    outgoingResponse.setHeader('Content-Type', 'application/json; charset=utf-8');
    outgoingResponse.end(
      JSON.stringify({
        result: false,
        message: error instanceof Error ? error.message : 'mock server error',
        data: null,
        criticalProcess: {},
      }),
    );
  }
});

server.listen(port, host, () => {
  console.log(`ted-sbrain mock listening at http://localhost:${port}/ted-sbrain`);
});
