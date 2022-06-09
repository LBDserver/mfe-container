import React, { useEffect, useState } from 'react'
import {
  Routes,
  Route
} from "react-router-dom";
import Header from "./components/header"
import Cookies from 'universal-cookie';
import {generateFetch, generateAccessToken} from "./components/login/auth"
import { session as s, aggregator as a, projects as p, activeProjects as ap, activeDatasets as ad, selectedElements as se } from './atoms'
import { useRecoilState, useRecoilValueLoadable, useRecoilValue } from 'recoil'
import {Buffer} from 'buffer'
import c from './federation/configuration'
import Layout from './federation/Layout'
import {CircularProgress, Box} from '@mui/material'

function App() {
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useRecoilState(s)
  const [activeProjects, setActiveProjects] = useRecoilState(ap)
  const projects = useRecoilValueLoadable(p)
  const [aggregator, setAggregator] = useRecoilState(a)
  const [activeDatasets, setActiveDatasets] = useRecoilState(ad)
  const [selectedElements, setSelectedElements] = useRecoilState(se)
  const config = useRecoilValue(c)

  // useEffect(() => {
  //   console.log('projects', projects)
  // }, [projects])

  useEffect(() => {
    async function load() {
      const cookies = new Cookies();

      try {
        setLoading(true)
        const oidcIssuer = cookies.get('oidcIssuer')
        let c = cookies.get('solid_cred')
        if (!c) throw new Error('could not retrieve valid credentials from browser cookies')
        const [email, webId, password] = Buffer.from(c, "base64").toString("ascii").split(':*:')

        const res = await generateAccessToken(email, password, oidcIssuer, webId)
        const f = await generateFetch(res)        
      // test
        if (webId) {
          const acl = webId.split('#')[0] + ".acl"
          const statusWebIdExists = await f(webId, {method: "HEAD"}).then(i => i.status)
          const statusIsTheOwner = await f(acl, {method: "HEAD"}).then(i => i.status)
          if (statusIsTheOwner == 200 && statusWebIdExists == 200) {
            setSession({
              fetch: f,
              solid_cred: Buffer.from(`${email}:*:${webId}:*:${password}`).toString("base64"),
              info: {
                isLoggedIn: true,
                webId
              }
            }
            )
          } else {
            throw new Error('could not retrieve valid credentials from browser cookies')
          }
        }
      } catch (error) {
        // cookies.remove("solid_cred")
        // cookies.remove("oidcIssuer")
      }
    }
    load().then(() => setLoading(false))
  }, [])

  const pages = [
    // {label: "demo", path: "/", component: DemoPage, props: {}},
    { label: "federation", path: "/", component: Layout, props: { initialLayout: config, sharedProps: {session, aggregator, setAggregator, projects: projects.contents, activeProjects, setActiveProjects, activeDatasets, setActiveDatasets, selectedElements, setSelectedElements}} },
    // { label: "documentation", path: "/documentation", component: SdkDemo, props: {} },
    // { label: "enrichment", path: "/enrichment", component: Enrichment, props: {} },
    // { label: "experiment", path: "/experiment", component: Exploded, props: {} },
    // { label: "project", path: "/project", component: Project, props: {} }
  ]

  return (
    <div>
      {loading ? (
    <Box sx={{ display: 'flex' }}>
    <CircularProgress style={{margin: "auto", marginTop: "20%"}}/>
  </Box>      ) : (
        <div>
        <Header pages={pages} />
        <Routes>
          {pages.map(page => {
            const Element = page.component
            return <Route key={page.label} path={page.path} element={<Element {...page.props} />} />
          })}
        </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
