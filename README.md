# koshi-backend

Tesla Go Anywhere for Alternative Fuels \
Api and other infrastructure modules needed to run koshi's backend locally \
Needs a bit of extra config if you wanted to host this as is - mainly around dozzle and nginx

## Purpose

- Passion project I've been putting off for a bit
  - Passion project because I do not see this being practical.
  - To reliably get e85 ( an ethanol-fuel mixture ) across long distance road trips would require some miracles, I think. Maybe it works it some scenarios though. We'll see.
- Enforce everything I learned mainly during internship

## Feature ideas

- Google / Github Sign In
- Email / Magic Link Sign In
- Track personal vehicles gas mileage with different fuels/ethanol blends ( necessary for routing )
- Route between two locations with considerations of specified fuel stations based on above fuel economy
  - three js *cool* feature to map route on globe or etc
- Small social media features to share routes, photos on road trips, comments etc
- Stretch: For user car, fetch manual then create/use mobile app to sync obd2 data to server and notify user of upcoming service
  - Really only useful for older cars

## Concepts Tackled ( Rewrite this )

- git flow / agile-ish project mgmt?
- jwt authentication
- unit testing, e2e testing, load testing 
- monolithic architecture
- SPA practices
- REST API design 
- File uploads
- Message queues
- SQL
- Redis (caching)
- s3 (object store)
- Docker compose mgmt 
- Reverse proxying
- VPS security/hardening/deployments

## Tech Stack

- Node.js / Nest.js
- Better-Auth (?)
  - as of 3/25, nest integration is wip: https://github.com/better-auth/better-auth/pull/1548
- PostgreSQL 
- Sqlite
- Minio (S3)
- RabbitMQ (~SQS)
- Resend (SMTP) (Don't want to self host atm)
- Docker
- Linux/VPS Mgmt (Deployment)
