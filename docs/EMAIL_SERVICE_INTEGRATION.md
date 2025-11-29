# 📧 Email Service Integration for Blitz

Complete guide to integrating email services with your Blitz platform (Railway + Vercel).

---

## 🎯 Why Use Third-Party Email Services?

**Railway & Vercel both recommend API-based email services because:**
- ✅ Better deliverability (dedicated IPs, reputation management)
- ✅ Analytics & tracking built-in
- ✅ No SMTP timeout issues in serverless
- ✅ Professional features (templates, scheduling, etc.)
- ✅ Generous free tiers

---

## 📊 Service Comparison

| Service | Free Tier | Paid Start | Best For | Integration |
|---------|-----------|------------|----------|-------------|
| **Resend** | 3k/month, 100/day | $20/50k | Next.js, Dev Experience | Official Vercel |
| **SendGrid** | 100/day | $15/50k | Reliability, Scale | Easy |
| **Mailgun** | 5k/month (3mo) | $35/50k | Developers, API | Easy |
| **Postmark** | 100/month | $15/10k | Deliverability | Easy |
| **Brevo** | 300/day | $25/unlimited | Marketing + Trans | Easy |

---

## 🚀 Option 1: Resend (Recommended)

### Why Resend?
- Built specifically for Next.js/React developers
- Official Vercel integration
- React Email support (beautiful email templates)
- Best developer experience
- 3,000 free emails/month

### Setup Steps

#### 1. Create Resend Account
```bash
# Sign up at https://resend.com
# Verify your domain (or use onboarding@resend.dev for testing)
```

#### 2. Install Package
```bash
npm install resend
```

#### 3. Get API Key
1. Go to https://resend.com/api-keys
2. Create new API key
3. Copy the key (starts with `re_`)

#### 4. Add to Environment Variables

**Railway Backend:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

**Vercel Frontend:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

#### 5. Backend Implementation (Railway)

**File: `app/services/email_service.py`**

```python
import os
import requests
from typing import List, Optional

class ResendEmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.base_url = "https://api.resend.com/emails"
        
    def send_launch_email(
        self,
        to: str,
        audience_type: str,
        subject: Optional[str] = None
    ) -> dict:
        """Send launch notification email"""
        
        # Email content based on audience type
        templates = {
            "product-dev": {
                "subject": "🎉 Blitz is Live - Get Your Products Promoted!",
                "html": self._get_product_dev_template()
            },
            "affiliate": {
                "subject": "💰 Blitz is Live - Start Earning Today!",
                "html": self._get_affiliate_template()
            },
            "business": {
                "subject": "🚀 Blitz is Live - AI Marketing at Your Fingertips!",
                "html": self._get_business_template()
            }
        }
        
        template = templates.get(audience_type, templates["affiliate"])
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Blitz <launch@yourdomain.com>",  # Use your verified domain
            "to": [to],
            "subject": subject or template["subject"],
            "html": template["html"]
        }
        
        response = requests.post(
            self.base_url,
            headers=headers,
            json=payload
        )
        
        return response.json()
    
    def send_welcome_email(self, to: str, name: str = None) -> dict:
        """Send welcome email to new signups"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "Blitz <hello@yourdomain.com>",
            "to": [to],
            "subject": "Welcome to Blitz! 🎉",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Welcome to Blitz!</h1>
                <p>Hi{f' {name}' if name else ''},</p>
                <p>Thanks for joining our waitlist! We're excited to have you on board.</p>
                <p>We'll notify you as soon as Blitz launches. In the meantime:</p>
                <ul>
                    <li>Follow us on Twitter for updates</li>
                    <li>Join our Discord community</li>
                    <li>Check out our blog for tips</li>
                </ul>
                <p>See you soon!</p>
                <p>— The Blitz Team</p>
            </div>
            """
        }
        
        response = requests.post(
            self.base_url,
            headers=headers,
            json=payload
        )
        
        return response.json()
    
    def _get_product_dev_template(self) -> str:
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #8b5cf6;">🎯 Blitz is Live!</h1>
                <p>Great news! Blitz is officially launched and ready for your products.</p>
                <p><strong>What you can do now:</strong></p>
                <ul>
                    <li>Add your products in 2 minutes</li>
                    <li>Get instant AI-powered intelligence</li>
                    <li>Access our network of affiliate marketers</li>
                    <li>Track performance in real-time</li>
                </ul>
                <a href="https://blitz.com/login" style="display: inline-block; background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Get Started →
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Questions? Reply to this email or visit our help center.
                </p>
            </div>
        </div>
        """
    
    def _get_affiliate_template(self) -> str:
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #10b981;">💰 Blitz is Live!</h1>
                <p>Start creating AI-powered campaigns and earning commissions today!</p>
                <p><strong>What's waiting for you:</strong></p>
                <ul>
                    <li>Browse hundreds of products to promote</li>
                    <li>Generate content in minutes with AI</li>
                    <li>Create images, articles, emails, and more</li>
                    <li>Track your earnings in real-time</li>
                </ul>
                <a href="https://blitz.com/login" style="display: inline-block; background: linear-gradient(to right, #10b981, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Start Earning →
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Questions? Reply to this email or join our Discord community.
                </p>
            </div>
        </div>
        """
    
    def _get_business_template(self) -> str:
        return """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; padding: 40px;">
                <h1 style="color: #3b82f6;">🚀 Blitz is Live!</h1>
                <p>Your AI marketing team is ready to work!</p>
                <p><strong>Start growing your business:</strong></p>
                <ul>
                    <li>Generate professional content instantly</li>
                    <li>Access AI-powered marketing campaigns</li>
                    <li>Connect with affiliate marketers</li>
                    <li>Save $150k+/year vs agencies</li>
                </ul>
                <a href="https://blitz.com/login" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Launch Your Campaigns →
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Need help? Reply to this email or schedule a demo.
                </p>
            </div>
        </div>
        """

# Usage in your signup endpoint
email_service = ResendEmailService()

@app.post("/api/signup")
async def create_signup(signup: EmailSignupCreate, db: Session = Depends(get_db)):
    # ... create signup logic ...
    
    # Send welcome email
    try:
        email_service.send_welcome_email(signup.email)
    except Exception as e:
        # Log error but don't fail the signup
        print(f"Failed to send welcome email: {e}")
    
    return db_signup
```

#### 6. Frontend Implementation (Vercel)

**File: `app/api/send-email/route.ts`**

```typescript
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Blitz <hello@yourdomain.com>',
      to: [email],
      subject: 'Welcome to Blitz! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Blitz!</h1>
          <p>Hi ${name || 'there'},</p>
          <p>Thanks for joining our waitlist!</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
```

---

## 🔧 Option 2: SendGrid

### Setup Steps

#### 1. Create Account
- Sign up at https://sendgrid.com
- Verify your email
- Complete sender verification

#### 2. Get API Key
1. Go to Settings → API Keys
2. Create API Key with "Full Access"
3. Copy key (starts with `SG.`)

#### 3. Install Package
```bash
pip install sendgrid
```

#### 4. Backend Implementation

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

class SendGridEmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.sg = SendGridAPIClient(self.api_key)
        
    def send_launch_email(self, to: str, audience_type: str):
        """Send launch notification"""
        
        templates = {
            "product-dev": {
                "subject": "🎉 Blitz is Live - Get Your Products Promoted!",
                "content": "HTML content here..."
            },
            "affiliate": {
                "subject": "💰 Blitz is Live - Start Earning Today!",
                "content": "HTML content here..."
            },
            "business": {
                "subject": "🚀 Blitz is Live!",
                "content": "HTML content here..."
            }
        }
        
        template = templates.get(audience_type, templates["affiliate"])
        
        message = Mail(
            from_email=Email("launch@yourdomain.com", "Blitz"),
            to_emails=To(to),
            subject=template["subject"],
            html_content=Content("text/html", template["content"])
        )
        
        try:
            response = self.sg.send(message)
            return {
                "status_code": response.status_code,
                "success": True
            }
        except Exception as e:
            print(f"SendGrid error: {e}")
            return {"success": False, "error": str(e)}
    
    def send_bulk_emails(self, recipients: list, subject: str, content: str):
        """Send to multiple recipients"""
        
        message = Mail(
            from_email=Email("hello@yourdomain.com", "Blitz"),
            to_emails=[To(email) for email in recipients],
            subject=subject,
            html_content=Content("text/html", content)
        )
        
        try:
            response = self.sg.send(message)
            return {"success": True, "status_code": response.status_code}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Environment variable
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxx
```

---

## 📮 Option 3: Mailgun

### Setup Steps

#### 1. Create Account
- Sign up at https://mailgun.com
- Verify domain or use sandbox domain for testing

#### 2. Get API Key
1. Go to Settings → API Keys
2. Copy your "Private API key"

#### 3. Install Package
```bash
pip install requests  # Mailgun uses simple HTTP API
```

#### 4. Backend Implementation

```python
import os
import requests

class MailgunEmailService:
    def __init__(self):
        self.api_key = os.getenv("MAILGUN_API_KEY")
        self.domain = os.getenv("MAILGUN_DOMAIN")  # e.g., "mg.yourdomain.com"
        self.base_url = f"https://api.mailgun.net/v3/{self.domain}"
        
    def send_launch_email(self, to: str, audience_type: str):
        """Send launch notification"""
        
        templates = {
            "product-dev": {
                "subject": "🎉 Blitz is Live!",
                "html": "HTML content..."
            }
        }
        
        template = templates.get(audience_type, templates["affiliate"])
        
        response = requests.post(
            f"{self.base_url}/messages",
            auth=("api", self.api_key),
            data={
                "from": "Blitz <launch@yourdomain.com>",
                "to": [to],
                "subject": template["subject"],
                "html": template["html"]
            }
        )
        
        return response.json()
    
    def send_batch_emails(self, recipients: list, subject: str, html: str):
        """Send to multiple recipients (up to 1000 per request)"""
        
        # Mailgun supports recipient variables for personalization
        response = requests.post(
            f"{self.base_url}/messages",
            auth=("api", self.api_key),
            data={
                "from": "Blitz <hello@yourdomain.com>",
                "to": recipients,
                "subject": subject,
                "html": html
            }
        )
        
        return response.json()

# Environment variables
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
```

---

## 🎨 Using React Email (with Resend)

For beautiful, maintainable email templates:

```bash
npm install react-email @react-email/components
```

**Create email template: `emails/WelcomeEmail.tsx`**

```typescript
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name?: string;
  audienceType: 'product-dev' | 'affiliate' | 'business';
}

export default function WelcomeEmail({ name, audienceType }: WelcomeEmailProps) {
  const content = {
    'product-dev': {
      title: '🎯 Get Your Products Promoted',
      message: 'Access our network of affiliate marketers ready to promote your products.',
    },
    'affiliate': {
      title: '💰 Start Earning Today',
      message: 'Browse products and create AI-powered campaigns in minutes.',
    },
    'business': {
      title: '🚀 Your AI Marketing Team',
      message: 'Generate professional content and grow your business on autopilot.',
    },
  };

  const { title, message } = content[audienceType];

  return (
    <Html>
      <Head />
      <Preview>Welcome to Blitz - {title}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px' }}>
            <Text style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
              Welcome to Blitz!
            </Text>
            <Text style={{ fontSize: '18px', color: '#374151' }}>
              Hi {name || 'there'} 👋
            </Text>
            <Text style={{ fontSize: '16px', color: '#6b7280', lineHeight: '24px' }}>
              {message}
            </Text>
            <Button
              href="https://blitz.com/login"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '20px',
              }}
            >
              Get Started →
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

**Use in API route:**

```typescript
import { Resend } from 'resend';
import WelcomeEmail from '@/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Blitz <hello@yourdomain.com>',
  to: email,
  subject: 'Welcome to Blitz!',
  react: WelcomeEmail({ name: 'John', audienceType: 'affiliate' }),
});
```

---

## 📊 Integration Comparison

### Quick Setup (Fastest)
1. **Resend** - 5 minutes with Vercel integration
2. **Mailgun** - 10 minutes via API
3. **SendGrid** - 15 minutes (more setup steps)

### Best Free Tier
1. **Resend** - 3,000/month
2. **SendGrid** - 100/day (3,000/month)
3. **Mailgun** - 5,000/month (first 3 months only)

### Best for Scale
1. **SendGrid** - Enterprise-grade
2. **Mailgun** - Developer-friendly at scale
3. **Resend** - Growing fast

---

## 🚀 Implementation Checklist

### For MiniMax

- [ ] Choose email service (recommend Resend for speed)
- [ ] Create account and get API key
- [ ] Add API key to Railway environment variables
- [ ] Add API key to Vercel environment variables
- [ ] Implement email service in backend
- [ ] Test welcome email on signup
- [ ] Create email templates for each audience type
- [ ] Test launch email sending
- [ ] Set up email tracking/analytics
- [ ] Configure sending domain (for production)

---

## 💡 Pro Tips

1. **Start with Resend** - Fastest setup, great DX, generous free tier
2. **Use React Email** - Maintainable, version-controlled email templates
3. **Test with dev emails first** - All services offer sandbox/test modes
4. **Track opens/clicks** - Built into all these services
5. **Set up SPF/DKIM** - For better deliverability (each service guides you)
6. **Batch sends for launch** - Don't send 1000 emails one-by-one

---

## 🔗 Useful Links

- Resend Docs: https://resend.com/docs
- SendGrid Docs: https://docs.sendgrid.com
- Mailgun Docs: https://documentation.mailgun.com
- React Email: https://react.email
- Vercel Email Guide: https://vercel.com/guides/sending-emails

---

## ✅ Recommendation for Blitz

**Use Resend because:**
1. ✅ Best developer experience
2. ✅ Official Vercel integration (1-click setup)
3. ✅ React Email support (beautiful templates)
4. ✅ 3,000 free emails/month
5. ✅ Built for modern JavaScript apps
6. ✅ Excellent documentation
7. ✅ Fast setup (5-10 minutes total)

**Estimated Implementation Time:** 30 minutes to 1 hour

You're all set to send emails! 📧✨

---

## 🎯 **INTEGRATION WITH EXISTING ADMIN SIGNUPS PAGE**

### **Quick Start: Add Email Sending to Admin UI**

You now have `/admin/signups` page with export functionality. To add **direct email sending** from the admin interface:

### **Step 1: Add Email Service to Backend**

**File: `app/services/resend_service.py`**

```python
import os
import asyncio
from typing import List, Optional, Dict, Any
from resend import Resend
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class ResendService:
    def __init__(self):
        self.resend = Resend(api_key=os.getenv("RESEND_API_KEY"))
        self.from_email = os.getenv("FROM_EMAIL", "Blitz <hello@blitz.com>")

    async def send_email(
        self,
        to: str | List[str],
        subject: str,
        html: str,
        text: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send single email or batch"""
        try:
            response = self.resend.emails.send({
                "from": self.from_email,
                "to": to if isinstance(to, list) else [to],
                "subject": subject,
                "html": html,
                "text": text
            })
            return {"success": True, "data": response}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def send_campaign_to_audience(
        self,
        emails: List[str],
        subject: str,
        template: str,
        variables: Optional[Dict[str, Any]] = None
    ) -> Dict[str, int]:
        """Send campaign to audience group"""
        success_count = 0
        error_count = 0
        errors = []

        # Resend supports up to 100 emails per request
        for i in range(0, len(emails), 100):
            batch = emails[i:i + 100]

            # Personalize content for each email
            personalized_emails = []
            for email in batch:
                personalized_html = template
                if variables:
                    for key, value in variables.items():
                        personalized_html = personalized_html.replace(f"{{{{ {key} }}}}", str(value))

                try:
                    result = await self.send_email(
                        to=email,
                        subject=subject,
                        html=personalized_html
                    )

                    if result["success"]:
                        success_count += 1
                    else:
                        error_count += 1
                        errors.append({"email": email, "error": result["error"]})

                except Exception as e:
                    error_count += 1
                    errors.append({"email": email, "error": str(e)})

        return {
            "success_count": success_count,
            "error_count": error_count,
            "total_sent": len(emails),
            "errors": errors[:10]  # First 10 errors
        }

    def get_launch_template(self, audience_type: str, variables: Dict[str, Any] = None) -> str:
        """Get email template based on audience type"""

        templates = {
            "product-dev": {
                "preheader": "Get your products promoted by our affiliate network",
                "title": "🎯 Your Products Are Ready for Promotion",
                "hero_emoji": "🎯",
                "primary_color": "#8b5cf6",
                "cta_text": "Add Your Products →",
                "cta_url": "https://blitz.com/login",
                "features": [
                    "Access our network of 1000+ affiliate marketers",
                    "AI-powered product intelligence and descriptions",
                    "Real-time performance tracking and analytics",
                    "Automated commission management"
                ]
            },
            "affiliate": {
                "preheader": "Start earning with AI-powered campaigns",
                "title": "💰 Start Earning with Blitz Today",
                "hero_emoji": "💰",
                "primary_color": "#10b981",
                "cta_text": "Browse Products →",
                "cta_url": "https://blitz.com/login",
                "features": [
                    "Browse hundreds of products to promote",
                    "Generate content in minutes with AI",
                    "Create articles, emails, videos, and social posts",
                    "Track earnings in real-time"
                ]
            },
            "business": {
                "preheader": "Your AI marketing team is ready",
                "title": "🚀 Your AI Marketing Team is Here",
                "hero_emoji": "🚀",
                "primary_color": "#3b82f6",
                "cta_text": "Launch Campaigns →",
                "cta_url": "https://blitz.com/login",
                "features": [
                    "Generate professional content instantly",
                    "Access AI-powered marketing campaigns",
                    "Connect with affiliate marketers",
                    "Save $150k+/year vs agencies"
                ]
            }
        }

        template_data = templates.get(audience_type, templates["affiliate"])

        if variables:
            template_data.update(variables)

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }}
                .content {{ background: white; padding: 40px; border-radius: 10px; margin-top: -20px; position: relative; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(to right, {template_data['primary_color']}, #667eea);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .feature-list {{ list-style: none; padding: 0; }}
                .feature-list li {{ padding: 10px 0; border-bottom: 1px solid #eee; }}
                .feature-list li:before {{ content: "✅ "; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="font-size: 60px; margin-bottom: 20px;">{template_data['hero_emoji']}</div>
                    <h1 style="margin: 0; font-size: 28px;">Blitz is Now Live!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">{template_data['preheader']}</p>
                </div>

                <div class="content">
                    <h2 style="color: #222; font-size: 24px;">{template_data['title']}</h2>

                    <p style="font-size: 16px; color: #555;">
                        Hi {{{{ first_name }}}},
                    </p>

                    <p style="font-size: 16px; color: #555;">
                        Great news! Blitz is officially launched and ready to use.
                    </p>

                    <p style="font-size: 16px; color: #555; font-weight: bold;">
                        What you can do now:
                    </p>

                    <ul class="feature-list">
                        {"".join([f"<li>{feature}</li>" for feature in template_data['features']])}
                    </ul>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{template_data['cta_url']}" class="cta-button">
                            {template_data['cta_text']}
                        </a>
                    </div>

                    <p style="font-size: 16px; color: #555;">
                        Questions? Just reply to this email—we're here to help!
                    </p>

                    <p style="font-size: 16px; color: #555;">
                        — The Blitz Team
                    </p>
                </div>

                <div class="footer">
                    <p>© 2024 Blitz. All rights reserved.</p>
                    <p>
                        <a href="{{{{ unsubscribe_url }}}}">Unsubscribe</a> |
                        <a href="https://blitz.com">Visit Website</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        return html
```

### **Step 2: Add Email Campaign API Endpoints**

**File: `app/api/admin/campaigns.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import asyncio

from app.db.session import get_db
from app.db.models import EmailSignup
from app.services.resend_service import ResendService
from app.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin-campaigns"])
resend_service = ResendService()

@router.post("/campaigns/send")
async def send_campaign(
    background_tasks: BackgroundTasks,
    audience_type: Optional[str] = Query(None, description="Filter by audience"),
    subject: str = Query(..., description="Email subject"),
    template_type: str = Query("launch", description="Template type"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send campaign email to signups.
    Supports sending to all signups or filtered by audience_type.
    """

    # Get signups
    query = select(EmailSignup).where(EmailSignup.is_active == True)

    if audience_type:
        query = query.where(EmailSignup.audience_type == audience_type)

    result = await db.execute(query)
    signups = result.scalars().all()

    if not signups:
        raise HTTPException(status_code=404, detail="No signups found")

    # Get emails list
    emails = [signup.email for signup in signups]

    # Get template
    template = resend_service.get_launch_template(
        audience_type or "affiliate",
        {"first_name": ""}
    )

    # Send campaign in background
    background_tasks.add_task(
        resend_service.send_campaign_to_audience,
        emails,
        subject,
        template
    )

    return {
        "message": f"Campaign started for {len(emails)} recipients",
        "total_emails": len(emails),
        "audience_type": audience_type or "all"
    }

@router.post("/campaigns/send-single")
async def send_single_email(
    email: str,
    subject: str,
    html: str,
    current_user=Depends(get_current_user)
):
    """Send email to single recipient"""

    result = await resend_service.send_email(email, subject, html)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "message": "Email sent successfully",
        "email_id": result["data"]["id"]
    }
```

**Add to `app/main.py`:**
```python
from app.api.admin import campaigns as admin_campaigns

app.include_router(admin_campaigns.router)
```

### **Step 3: Update Admin Signups Page with Email Actions**

**Add to `src/app/admin/signups/page.tsx`:**

```typescript
// Add these imports
import { Mail, Send, Users } from "lucide-react";

// Add these states
const [showEmailModal, setShowEmailModal] = useState(false);
const [emailSubject, setEmailSubject] = useState("");
const [selectedAudience, setSelectedAudience] = useState<string>("");

// Add email campaign mutation
const sendCampaignMutation = useMutation({
  mutationFn: async ({ audienceType, subject }: { audienceType: string; subject: string }) => {
    const response = await api.post("/api/admin/campaigns/send", null, {
      params: {
        audience_type: audienceType,
        subject: subject,
        template_type: "launch"
      }
    });
    return response.data;
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["admin-signups"] });
    toast.success(`Campaign started! Sending to ${data.total_emails} recipients`);
    setShowEmailModal(false);
    setEmailSubject("");
  },
  onError: (error: any) => {
    toast.error(`Failed to send campaign: ${error.message}`);
  }
});

// Add button in header
<button
  onClick={() => setShowEmailModal(true)}
  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
>
  <Mail size={18} />
  Send Campaign
</button>

// Add email modal component (after the main content)
{showEmailModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[var(--bg-secondary)] rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        Send Email Campaign
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Audience
          </label>
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          >
            <option value="">All Audiences</option>
            <option value="product-dev">Product Developers</option>
            <option value="affiliate">Affiliates</option>
            <option value="business">Businesses</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="🎉 Blitz is Live!"
            className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Send className="text-blue-600 mt-1" size={20} />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Email Template
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Launch email template will be sent with subject line above.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            setShowEmailModal(false);
            setEmailSubject("");
            setSelectedAudience("");
          }}
          className="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!emailSubject) {
              toast.error("Please enter a subject line");
              return;
            }
            sendCampaignMutation.mutate({
              audienceType: selectedAudience,
              subject: emailSubject
            });
          }}
          disabled={sendCampaignMutation.isPending}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {sendCampaignMutation.isPending ? "Sending..." : "Send Campaign"}
        </button>
      </div>
    </div>
  </div>
)}
```

### **Step 4: Install Resend SDK**

```bash
# Backend
pip install resend

# Frontend (optional, if using Next.js API routes)
npm install resend
```

### **Step 5: Environment Variables**

**Railway Backend:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=Blitz <hello@blitz.com>
```

**Vercel Frontend:**
```env
NEXT_PUBLIC_RESEND_ENABLED=true
```

---

## 🎯 **WHAT YOU GET**

After implementing:

1. **Export CSV** - Download signups for external tools ✓ (Already working)
2. **Send Campaigns** - Send emails directly from admin UI to:
   - All signups
   - Product Developers only
   - Affiliates only
   - Businesses only
   - Selected individuals (future enhancement)

3. **Email Templates** - Professional HTML templates for each audience type
4. **Analytics** - Track opens/clicks in Resend dashboard
5. **Unsubscribe** - Built-in unsubscribe links

---

## ⚡ **Quick Implementation (30 minutes)**

1. Install resend: `pip install resend` ✓
2. Add environment variable: `RESEND_API_KEY` ✓
3. Create `app/services/resend_service.py` (copy from above) ✓
4. Create `app/api/admin/campaigns.py` (copy from above) ✓
5. Update admin/signups page with email button (copy from above) ✓
6. Test with 1-2 emails ✓

Done! You can now send email campaigns directly from the admin interface! 🚀