import { createDpopHeader, generateDpopKeyPair, buildAuthenticatedFetch} from '@inrupt/solid-client-authn-core';
import {v4} from 'uuid' 
import {Buffer} from 'buffer'

async function generateFetch({token, dpop}) {
    try {
        const authFetch = await buildAuthenticatedFetch(fetch, token, { dpopKey: dpop });
        return authFetch
    } catch (error) {
        console.log('error', error)
        throw error
    }
}

async function generateAccessToken(email: string, password:string, idp: string): Promise<any>{
    if (!idp.endsWith("/")) idp += '/'
    const response = await fetch(`${idp}idp/credentials/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password, name: v4() }),
    });

    const {id, secret}= await response.json();
    console.log('id, secret', id, secret)
    const tokenUrl = `${idp}.oidc/token`;
    const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
    const dpopKey = await generateDpopKeyPair();
    const r = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            // The header needs to be in base64 encoding.
            authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
        },
        body: 'grant_type=client_credentials&scope=webid',
    });
    console.log('r', r)
    const {access_token} = await r.json();
    return {token: access_token, dpop: dpopKey}
}

export {generateAccessToken, generateFetch}