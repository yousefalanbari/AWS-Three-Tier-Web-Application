# AWS Three-Tier Task Manager

A deployment-ready sample application for an AWS three-tier architecture:

- Web tier: React + Vite served by NGINX on EC2
- Application tier: Node.js + Express on EC2, port 4000
- Database tier: MySQL or Amazon Aurora MySQL

## Architecture flow

Internet -> External ALB -> Web EC2/ASG -> Internal ALB -> App EC2/ASG -> RDS/Aurora MySQL

## 1. Database tier

Connect to the RDS writer endpoint and run:

```bash
mysql -h YOUR_RDS_ENDPOINT -u YOUR_DB_USER -p < db-tier/schema.sql
```

Your database security group should allow TCP 3306 only from the app-tier security group.

## 2. Application tier

```bash
cd app-tier
cp .env.example .env
nano .env
npm install
npm start
```

For PM2:

```bash
sudo npm install -g pm2
pm2 start server.js --name three-tier-api
pm2 save
pm2 startup
```

Test locally on the app EC2 instance:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/tasks
```

The app-tier security group should allow TCP 4000 only from the internal ALB security group.
The internal ALB health check path should be `/health`.

## 3. Web tier

Edit `web-tier/nginx.conf` and replace:

```text
REPLACE_WITH_INTERNAL_ALB_DNS
```

with the internal load balancer DNS name, without `http://` and without brackets.

Build the React app:

```bash
cd web-tier
npm install
npm run build
```

Copy the generated `dist` files into the NGINX web root:

```bash
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r dist/* /usr/share/nginx/html/
sudo cp nginx.conf /etc/nginx/conf.d/default.conf
sudo nginx -t
sudo systemctl restart nginx
```

The web-tier security group should allow TCP 80 only from the external ALB security group.
The external ALB should listen on port 80 and forward to the web-tier target group.

## Recommended AWS resources

- 1 VPC
- 2 public web subnets
- 2 private app subnets
- 2 private database subnets
- Internet Gateway
- NAT Gateway for private app instances
- External ALB
- Internal ALB
- Web Auto Scaling Group
- App Auto Scaling Group
- Aurora MySQL or RDS MySQL
- S3 bucket for deployment files
- IAM EC2 role with SSM and S3 read access

## Environment variables

Application tier:

```env
PORT=4000
DB_HOST=your-rds-writer-endpoint
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=change-me
DB_NAME=webappdb
DB_SSL=false
```

Do not commit the real `.env` file or database password.
