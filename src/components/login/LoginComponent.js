import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Box, Dialog, useMediaQuery, DialogTitle, DialogContent, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import { getDefaultSession, login, Session } from '@inrupt/solid-client-authn-browser';
import { generateAccessToken, generateFetch } from './auth';
import { session as s } from '../../atoms'
import { useRecoilState } from 'recoil'
import Cookies from 'universal-cookie';
import {Buffer} from 'buffer'

const packageJSON = require("../../../package.json")


const AuthComponent = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return <Dialog
    fullScreen={fullScreen}
    open={open}
  >
    <DialogTitle>Log in with Solid</DialogTitle>
    <DialogContent>
      <LoginForm onClose={onClose} />
    </DialogContent>
  </Dialog>;
};

function LoginForm({ onClose }) {
  const [session, setSession] = useRecoilState(s)

  const [oidcIssuer, setOidcIssuer] = useState("https://pod.werbrouck.me");
  const [email, setEmail] = useState("dc@example.org");
  const [password, setPassword] = useState("test123");
  const [webId, setWebId] = useState("https://pod.werbrouck.me/dc/profile/card#me");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const onLoginClick = async (e) => {
    try {
      setLoading(e => true)
      const res = await generateAccessToken(email, password, oidcIssuer)
      const f = await generateFetch(res)
      console.log('f', f)
      // test
      const acl = webId.split('#')[0] + ".acl"
      const statusWebIdExists = await f(webId, {method: "HEAD"}).then(i => i.status)
      const statusIsTheOwner = await f(acl, {method: "HEAD"}).then(i => i.status)

      if (statusIsTheOwner != 200 || statusWebIdExists != 200) {
        throw new Error("This did not work. Try again.")
      }
  
      setSession({
        fetch: f,
        solid_cred: Buffer.from(`${email}:*:${webId}:*:${password}`).toString("base64"),
        info: {
          isLoggedIn: true,
          webId
        }
      }
      )
      const cookies = new Cookies()
      cookies.set("solid_cred", Buffer.from(`${email}:*:${webId}:*:${password}`).toString("base64"))
      cookies.set("oidcIssuer", oidcIssuer)
      setLoading(e => false)
      onClose()
    } catch (error) {
      setError(error.message)
      setLoading(e => false)
    }
  };

  return (
    <div style={{ alignContent: "center", padding: 30 }}>
      <TextField
        style={inputStyle}
        id="oidcIssuer"
        label="Solid Identity Provider"
        placeholder="Identity Provider"
        defaultValue={oidcIssuer}
        onChange={(e) => setOidcIssuer(e.target.value)}
        autoFocus
        fullWidth
      />
      <TextField
        style={inputStyle}
        id="webid"
        label="webid"
        placeholder="webid"
        defaultValue={webId}
        onChange={(e) => setWebId(e.target.value)}
        fullWidth
      />
      <TextField
        style={inputStyle}
        id="email"
        label="Email"
        placeholder="Email"
        defaultValue={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        style={inputStyle}
        id="password"
        label="Password"
        placeholder="Password"
        defaultValue={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        type="password"
        fullWidth
      />

      <Button style={buttonStyle} onClick={onLoginClick} disabled={loading} variant="contained" color="primary">
        Log In
      </Button>
      <Button style={{ ...buttonStyle, float: "right" }} disabled={loading} onClick={onClose} variant="contained" color="primary">
        Cancel
      </Button>
      {(error) ? (
        <Alert style={{margin: 5}} onClose={() => setError(prev => "")}severity="error">{error}</Alert>
      ) : (
        <></>
      )}
    </div>
  );
}

const inputStyle = {
  marginTop: 15
}

const buttonStyle = {
  marginTop: 15,
  width: "40%"
}

export default AuthComponent
