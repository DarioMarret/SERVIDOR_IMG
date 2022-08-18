module.exports = {
    apps : [{
      name   : "ApiConnectorMassive",
      script : "./server.js",
      watch: true,
      max_memory_restart: '1000M',
      exec_mode: 'cluster',
      instances: 1,
      cron_restart: "59 00 * * *",
      env: {
        NODE_ENV: "production",
        PORT:"4000",
        BASIC_USER:"bm",
        BASIC_PASS:"bm",
        INSTANCE_URL:"",
        INSTANCE_USERNAME:"",
        INSTANCE_PASSWORD:"",
        INSTANCE_SCHEMA:"",
        DOMINIO:"https://Imágenes.one.com.ec/img/",
        PATH_KEY_HTTPS:"./cert/crt.key",
        PATH_CERT_HTTPS:"./cert/crt.crt",
      },
      env_development: {
        NODE_ENV: "development"
      }
    }]
  }