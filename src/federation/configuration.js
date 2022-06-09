import React from "react";
import { atom } from "recoil";

const config = atom({
  key: "config",
  default: {
      "projectselector": {
        "url": "http://localhost:9001/remoteEntry.js",
        "scope": "projectselector",
        "label": "projectselector",
        "module": "./index",
        "dimensions": {
          "x": 0,
          "y": 0,
          "h": 16,
          "w": 5
        }
      },
      "alignment": {
        "url": "http://localhost:9000/remoteEntry.js",
        "scope": "alignment",
        "label": "alignment",
        "module": "./index",
        "dimensions": {
          "x": 0,
          "y": 16,
          "h": 12,
          "w": 10
        }
      },
      "viewer": {
        "url": "http://localhost:9002/remoteEntry.js",
        "scope": "viewer",
        "label": "viewer",
        "module": "./index",
        "dimensions": {
          "x": 5,
          "y": 0,
          "h": 16,
          "w": 5
        }
      }
  }})

export default config;
