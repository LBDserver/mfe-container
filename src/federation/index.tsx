import React, { useMemo, useState, useEffect, useRef } from "react";
import mem from "mem";
import { CircularProgress, Box, IconButton, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh';

declare const window: any
const loadComponent = mem(async (scope, module) => {
  const factory = await window[scope].get(module);
  return factory;
});

const useDynamicScript = mem((args): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!args.url) {
        console.log("no url provided");
        reject();
      }
      const element = document.createElement("script");

      element.src = args.url;
      element.type = "text/javascript";
      element.async = true;

      document.head.appendChild(element);

      element.onload = () => {
        resolve();
      };

      element.onerror = () => {
        reject();
      };
    } catch (error) {
      console.log(`error`, error);
      reject(error);
    }
  });
});

const getFromRemote = mem(async (system, module) => {
  try {
    await useDynamicScript(system);
    const factory = await loadComponent(system.scope, system.module);
    return factory()[module];
  } catch (error) {
    console.log(`error in getFromRemote`, error);
  }
});

const System = React.memo((props: any) => {
  const ref = useRef(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    getTheMount();
  });

  const getTheMount = async () => {
    try {
      const m = await getFromRemote(props.system, "default");
      if (m) {
        m(ref.current, {
          ...props.sharedProps,
          system: props.system
        });
      } else {
        throw new Error('Could not get remote component. Retry.')
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <div>
      {error ? (
        <div>
        <Typography variant="h5">Error Loading remote component</Typography>
          <p>{error}</p>
          <IconButton color="primary" aria-label="upload picture" component="span" onClick={() => getTheMount()}>
            <RefreshIcon />
          </IconButton>
        </div>
      ) : (
        <div ref={ref}>
          <CircularProgress style={{ margin: "auto", marginTop: "50%", display: "flex", justifyContent: "center" }} />
        </div>
      )}
    </div>
  );
});

export default System;
export { getFromRemote };
