# ~\.jupyter\jupyter_notebook_config.py

c.NotebookApp.iopub_data_rate_limit = 10000000

c.NotebookApp.tornado_settings = {
  "headers": {
    "Content-Security-Policy": "frame-ancestors *"
  }
}
