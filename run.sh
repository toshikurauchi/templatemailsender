#!/bin/bash

trap killgroup SIGINT

killgroup(){
  echo killing...
  kill 0
}

(cd backend && source env/bin/activate && uvicorn main:app) &
(cd frontend && npm run dev) &
wait
