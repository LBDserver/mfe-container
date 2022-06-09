import { atom, selector } from "recoil"
import { LbdProject, LbdService } from "lbdserver-client-api";
import fetch from 'cross-fetch'

const aggregator = atom({
  key: "accessPoint",
  default: "https://pod.werbrouck.me/dc/lbd/",
});

const session = atom({
  key: "credentials",
  default: {
    fetch: fetch,
    info: {
      isLoggedIn: false
    }
  }
})

const projects = selector({
  key: "projects",
  get: async ({ get }) => {
    const s = get(session)
    var myService = new LbdService(s)
    let myProjects = []
    if (get(aggregator).length > 0) myProjects = await myService.getAllProjects(get(aggregator))
    const initialized = []
    for (const project of myProjects) {
      const p = new LbdProject(s, project)
      await p.init()
      initialized.push(p)
    }
    return initialized
  },
});

const activeProjects = atom({
  key: "activeProjects",
  default: []
})

const activeDatasets = atom({
  key: "activeDatasets",
  default: []
})

const selectedElements = atom({
  key: "selectedElements",
  default: []
})


export { aggregator, session, projects, activeProjects, activeDatasets, selectedElements}