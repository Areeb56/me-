import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.router import ModelRouter
import json
import httpx
from datetime import datetime

router = ModelRouter()

async def run_browser_research(domain: str = None, website_url: str = None) -> dict:
    results = {
        "company_info": {},
        "team_info": [],
        "products": [],
        "pricing": {},
        "blog_posts": [],
        "tech_stack": [],
        "linkedin_data": {},
        "timestamp": datetime.utcnow().isoformat(),
    }

    url = website_url or f"https://{domain}" if domain else None

    if url:
        try:
            async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
                response = await client.get(url, headers={
                    "User-Agent": "Mozilla/5.0 (compatible; AIOS-Bot/1.0)"
                })

                if response.status_code == 200:
                    html = response.text[:50000]
                    results["company_info"] = await _extract_company_info(html, domain)
                    results["tech_stack"] = await _detect_tech_stack(response.headers, html)
        except Exception as e:
            results["error"] = str(e)

    if domain:
        results["linkedin_data"] = await _fetch_linkedin(domain)

    return results

async def _extract_company_info(html: str, domain: str) -> dict:
    system_prompt = """Extract company information from HTML content.
Return JSON with:
- name: company name
- description: what they do (1-2 sentences)
- industry: industry category
- employee_range: estimated size
- location: headquarters location
- key_products: list of main products/services"""

    prompt = f"""Extract company information from this HTML:

Domain: {domain}
HTML: {html[:10000]}

Return ONLY valid JSON."""

    try:
        response = await router.call(prompt, system=system_prompt, task_type="analysis", max_tokens=1000)
        return json.loads(response)
    except Exception:
        return {
            "name": domain,
            "description": "Company information not available",
            "industry": "Unknown",
            "employee_range": "Unknown",
            "location": "Unknown",
            "key_products": [],
        }

async def _detect_tech_stack(headers: dict, html: str) -> list[str]:
    tech_signals = {
        "X-Powered-By": "Express",
        "x-powered-by": "Express",
        "Server": "nginx",
        "x-generator": "WordPress",
        "X-Shopify": "Shopify",
        "cf-ray": "Cloudflare",
    }

    detected = []

    for header, tech in tech_signals.items():
        if header in headers:
            detected.append(tech)

    tech_indicators = {
        "react": "React",
        "next.js": "Next.js",
        "vue": "Vue.js",
        "angular": "Angular",
        "gatsby": "Gatsby",
        "wordpress": "WordPress",
        "shopify": "Shopify",
        "stripe": "Stripe",
        "google-analytics": "Google Analytics",
        "hubspot": "HubSpot",
        "salesforce": "Salesforce",
        "intercom": "Intercom",
    }

    html_lower = html.lower()
    for indicator, tech in tech_indicators.items():
        if indicator in html_lower:
            detected.append(tech)

    return list(set(detected))

async def _fetch_linkedin(domain: str) -> dict:
    linkedin_url = f"https://www.linkedin.com/company/{domain.replace('.com', '').replace('.', '-')}"

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
            response = await client.get(linkedin_url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; AIOS-Bot/1.0)"
            })
            if response.status_code == 200:
                return {"url": linkedin_url, "available": True}
    except Exception:
        pass

    return {"url": linkedin_url, "available": False}
