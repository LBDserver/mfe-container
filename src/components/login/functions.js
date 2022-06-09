import {getDefaultSession, handleIncomingRedirect} from '@inrupt/solid-client-authn-browser'
import {v4} from 'uuid'

// async function getAuthentication(setSessionUpdate) {
//     try {
//       if (!getDefaultSession().info.isLoggedIn) {
//         const params = new URLSearchParams(window.location.search);
//         const solidCode = params.get("code");
//         let restorePreviousSession = false
//         if (!solidCode) {
//             restorePreviousSession = true
//         }
//         return handleIncomingRedirect({ restorePreviousSession }).then(() => getDefaultSession());

//       }
//       return getDefaultSession();
//     } catch (error) {
//       console.log(`error`, error);
//     }
//   }

async function getAuthentication() {
  const params = new URLSearchParams(window.location.search);

      if (!getDefaultSession().info.isLoggedIn) {
        const solidCode = params.get("code");
        if (solidCode) {
          await handleIncomingRedirect();
        } else {
          await handleIncomingRedirect({ restorePreviousSession: true });
        }
      }
      return getDefaultSession();
  }

export {getAuthentication}