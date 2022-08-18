"use strict";

module.exports = {
  apps: [{
    name: "API IMAGENS",
    script: "./server.js",
    watch: true,
    max_memory_restart: '1000M',
    exec_mode: 'cluster',
    instances: 1,
    env: {
      NODE_ENV: "production",
      PORT: "4000",
      BASIC_USER: "bm",
      BASIC_PASS: "bm",
      DOMINIO: "https://imagenes.one.com.ec/img/"
    },
    env_development: {
      NODE_ENV: "development"
    }
  }]
};