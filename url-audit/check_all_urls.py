#!/usr/bin/env python3
"""
Fintutto & BescheidBoxer URL Audit Script
==========================================
Prüft alle URLs auf:
- HTTP Status Code (200, 301, 404, etc.)
- SSL-Zertifikat gültig
- Redirect-Ziel
- Title Tag
- Meta Description
- Google Analytics (GA4/UA)
- Google Tag Manager (GTM)
- Open Graph Tags
- Canonical Tag
- robots.txt vorhanden
- sitemap.xml vorhanden

Ausgabe: CSV + Markdown Report

Verwendung:
    pip install requests beautifulsoup4
    python3 check_all_urls.py
"""

import csv
import json
import os
import re
import ssl
import socket
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from urllib.parse import urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Bitte installiere die Abhängigkeiten:")
    print("  pip install requests beautifulsoup4")
    sys.exit(1)

# Alle URLs
URLS = [
    # === BESCHEIDBOXER APP ===
    "https://app.bescheidboxer.de/",
    "https://app.bescheidboxer.de/chat",
    "https://app.bescheidboxer.de/forum",
    "https://app.bescheidboxer.de/generator/akteneinsicht",
    "https://app.bescheidboxer.de/generator/antrag_einmalige_leistung",
    "https://app.bescheidboxer.de/generator/antrag_mehrbedarf",
    "https://app.bescheidboxer.de/generator/antrag_umzug",
    "https://app.bescheidboxer.de/generator/antrag_weiterbewilligung",
    "https://app.bescheidboxer.de/generator/beschwerde_sachbearbeiter",
    "https://app.bescheidboxer.de/generator/eilantrag_sozialgericht",
    "https://app.bescheidboxer.de/generator/fristverlängerung",
    "https://app.bescheidboxer.de/generator/ueberpruefungsantrag",
    "https://app.bescheidboxer.de/generator/widerspruch_aufhebung",
    "https://app.bescheidboxer.de/generator/widerspruch_bescheid",
    "https://app.bescheidboxer.de/generator/widerspruch_kdu",
    "https://app.bescheidboxer.de/generator/widerspruch_rueckforderung",
    "https://app.bescheidboxer.de/generator/widerspruch_sanktion",
    "https://app.bescheidboxer.de/impressum",
    "https://app.bescheidboxer.de/musterschreiben",
    "https://app.bescheidboxer.de/rechner",
    "https://app.bescheidboxer.de/rechner/buergergeld",
    "https://app.bescheidboxer.de/rechner/einkommen",
    "https://app.bescheidboxer.de/rechner/erstausstattung",
    "https://app.bescheidboxer.de/rechner/freibetrag",
    "https://app.bescheidboxer.de/rechner/fristen",
    "https://app.bescheidboxer.de/rechner/haushalt",
    "https://app.bescheidboxer.de/rechner/kdu",
    "https://app.bescheidboxer.de/rechner/mehrbedarf",
    "https://app.bescheidboxer.de/rechner/mietspiegel",
    "https://app.bescheidboxer.de/rechner/pkh",
    "https://app.bescheidboxer.de/rechner/sanktion",
    "https://app.bescheidboxer.de/rechner/schonvermoegen",
    "https://app.bescheidboxer.de/rechner/umzugskosten",
    "https://app.bescheidboxer.de/rechner/vergleich",
    "https://app.bescheidboxer.de/preise",
    "https://app.bescheidboxer.de/checklisten",
    "https://app.bescheidboxer.de/faq",
    "https://app.bescheidboxer.de/notfall",
    "https://app.bescheidboxer.de/anbieter-vergleich",
    "https://app.bescheidboxer.de/probleme",
    "https://app.bescheidboxer.de/anwaltssuche",
    "https://app.bescheidboxer.de/lernen",
    "https://app.bescheidboxer.de/suche",
    "https://app.bescheidboxer.de/erfolgsgeschichten",
    "https://app.bescheidboxer.de/sanktions-tracker",
    "https://app.bescheidboxer.de/kontakt",
    "https://app.bescheidboxer.de/tracker",
    # === BESCHEIDBOXER SUBDOMAINS ===
    "https://BB_agb.bescheidboxer.de",
    "https://BB_rechner-kdu.bescheidboxer.de",
    "https://BB_rechner.bescheidboxer.de",
    "https://BB_ueber-uns.bescheidboxer.de",
    "https://datenschutz.bescheidboxer.de",
    "https://generator-widerspruch-kdu.bescheidboxer.de",
    "https://rechner-kdu.bescheidboxer.de/",
    # === BESCHEIDBOXER EXTERNE DOMAINS ===
    "https://widerspruchjobcenter.de",
    "https://buergergeld-rechner.net",
    "https://buergergeld-sanktion.de",
    "https://buergergeldbescheid-check.de",
    "https://kdu-checker.de",
    "https://kdu-rechner.de",
    "https://kosten-der-unterkunft-rechner.de",
    "https://mehrbedarf-rechner.de",
    "https://buergergeld-blog.de",
    # === DEIBEL ===
    "https://deibel.info",
    # === FINTUTTO CLOUD ===
    "https://app.fintutto.cloud",
    "https://portal.fintutto.cloud",
    "https://betriebskosten.fintutto.cloud",
    "https://vermietify.fintutto.cloud",
    "https://zaehler.fintutto.cloud",
    "https://hausmeisterpro.fintutto.cloud",
    "https://mieterportal.fintutto.cloud",
    "https://admin.fintutto.cloud",
    "https://commander.fintutto.cloud",
    "https://fintutto.cloud",
    # === FINTUTTO.DE APPS ===
    "https://app.fintutto.de",
    "https://app-hausmeister-enterprice.fintutto.de",
    "https://app-hausmeistergo.fintutto.de",
    "https://app-hausmeisterpro.fintutto.de",
    "https://app-mieter.fintutto.de",
    "https://app-vermietify.fintutto.de",
    "https://app-zaehler.fintutto.de",
    "https://app-firma.fintutto.de",
    # === FINTUTTO.DE BUNDLES ===
    "https://bundle-allerechner.fintutto.de",
    "https://bundle-bankfinanzierung.fintutto.de",
    "https://bundle-fintuttolifetime.fintutto.de",
    "https://bundle-firstbyer.fintutto.de",
    "https://bundle-formularekomplett.fintutto.de",
    "https://bundle-hausmeister-starter.fintutto.de",
    "https://bundle-investorprofi.fintutto.de",
    "https://bundle-jahrespflichten.fintutto.de",
    "https://bundle-lifetime.fintutto.de",
    "https://bundle-makler.fintutto.de",
    "https://bundle-mieterapppremium.fintutto.de",
    "https://bundle-mieterwechsel.fintutto.de",
    "https://bundle-neuvermietung.fintutto.de",
    "https://bundle-problemmieter.fintutto.de",
    "https://bundle-steuerberater.fintutto.de",
    "https://bundle-vermietifypro.fintutto.de",
    "https://bundle-vermietifystarter.fintutto.de",
    # === FINTUTTO.DE CHECKER ===
    "https://checker.fintutto.de",
    "https://checker-betriebskosten.fintutto.de",
    "https://checker-eigenbedarf.fintutto.de",
    "https://checker-kaution.fintutto.de",
    "https://checker-kuendigung.fintutto.de",
    "https://checker-mieterhoehung.fintutto.de",
    "https://checker-mietminderung.fintutto.de",
    "https://checker-mietpreisbremse.fintutto.de",
    "https://checker-modernisierung.fintutto.de",
    "https://checker-nebenkosten.fintutto.de",
    "https://checker-schoenheitsreparaturen.fintutto.de",
    # === FINTUTTO.DE FORMULARE ===
    "https://formulare.fintutto.de",
    "https://formular-abmahnung.fintutto.de",
    "https://formular-bank-expose.fintutto.de",
    "https://formular-hausordnung.fintutto.de",
    "https://formular-indexmietvertrag.fintutto.de",
    "https://formular-kaution.fintutto.de",
    "https://formular-kuendigung.fintutto.de",
    "https://formular-maengelanzeige.fintutto.de",
    "https://formular-mahnung.fintutto.de",
    "https://formular-mietaufhebung.fintutto.de",
    "https://formular-mietbescheinigung.fintutto.de",
    "https://formular-mietbuergschaft.fintutto.de",
    "https://formular-mieterhoehung.fintutto.de",
    "https://formular-mietschuldenfreiheit.fintutto.de",
    "https://formular-modernisierung.fintutto.de",
    "https://formular-nachtrag.fintutto.de",
    "https://formular-ratenzahlung.fintutto.de",
    "https://formular-schufa.fintutto.de",
    "https://formular-selbstauskunft.fintutto.de",
    "https://formular-sepa.fintutto.fintutto.de",
    "https://formular-staffelmietvertrag.fintutto.de",
    "https://formular-stellplatz.fintutto.de",
    "https://formular-uebergabeprotokoll.fintutto.de",
    "https://formular-untermieterlaubnis.fintutto.de",
    "https://formular-vollmacht-mietangelegenheiten.fintutto.de",
    "https://formular-widerspruch-mieterhoehung.fintutto.de",
    "https://formular-widerspruch-nebenkostenabrechnung.fintutto.de",
    "https://formular-wohnungsgeberbestaetigung.fintutto.de",
    # === FINTUTTO.DE RECHNER ===
    "https://rechner.fintutto.de",
    "https://rechner-darlehen.fintutto.de",
    "https://rechner-energieausweis.fintutto.de",
    "https://rechner-heizkosten.fintutto.de",
    "https://rechner-kaufnebenkosten.fintutto.de",
    "https://rechner-kuendigungsfrist.fintutto.de",
    "https://rechner-mieterhoehung.fintutto.de",
    "https://rechner-modernisierung.fintutto.de",
    "https://rechner-provision.fintutto.de",
    "https://rechner-spekulationssteuer.fintutto.de",
    "https://rechner-staffelmiete.fintutto.de",
    "https://rechner-wohnflaeche.fintutto.de",
    # === FINTUTTO.DE TOOLS ===
    "https://tools.fintutto.de",
    "https://cashflow.fintutto.de",
    "https://gewerbemietvertrag.fintutto.de",
    "https://grundsteuer.fintutto.de",
    "https://kaufpreis.fintutto.de",
    "https://kaution.fintutto.de",
    "https://mieterapp.fintutto.de",
    "https://mietspiegel.fintutto.de",
    "https://nebenkostenabrechnung.fintutto.de",
    "https://tilgung.fintutto.de",
    "https://afa.fintutto.de",
    "https://anlage-v.fintutto.de",
    # === FINTUTTO.DE SONSTIGE ===
    "https://fintutto.de",
    "https://fintutto.fintutto.de",
    "https://mieter.fintutto.de",
    "https://portal.fintutto.de",
    "https://vermietiefy.fintutto.de",
    "https://vermietify.fintutto.de",
    "https://zaehler.fintutto.de",
    # === EXTERNE DOMAINS (Fintutto) ===
    "https://anlage-v-ausfuellen.de",
    "https://ftmieter.de",
    "https://kaufnebenkosten-rechner.de",
    "https://meinimmobilien-portfolio.de",
    "https://meinnebenkostenrechner.com",
    "https://meinrenditerechner.de",
    "https://meinuebergabeprotokoll.de",
    "https://mieterhoehung.eu",
    "https://mieterhohung-berechnen.de",
    "https://mieterhohung-rechner.de",
    "https://mietspiegel-finder.de",
    "https://mietvertrag-kuendigung.de",
    "https://nebenkostenrechner.eu",
    "https://vermietrendite-rechner.de",
    "https://diehausverwaltersoftware.de",
    "https://vacationmanager.de",
    "https://vermieter-steuern.de",
    "https://meinezaehlerapp.de",
    "https://diehausmeisterapp.de",
    "https://diehausverwaltungsoftware.de",
    "https://fthausmeister.de",
    "https://fthausverwaltungsoftware.de",
    "https://hausmeisterenterprise.de",
    "https://hausmeistergo.de",
    "https://meinemieterapp.de",
    "https://kautions-rechner.de",
    "https://meinafa-rechner.de",
    "https://meineanlage-v.de",
    "https://meinkuendigungsfristcheck.de",
    "https://meinmieterhoehungscheck.de",
    "https://meinmietspiegel.de",
    "https://meinnebenkostenabrechnungscheck.de",
    "https://meinnebenkostencheck.eu",
    "https://nebenkostenabrechnung-prufen.de",
    "https://portfolio-rechner.de",
    "https://afa-rechner-immobilien.de",
    "https://afa-rechner.eu",
    # === FINTUTTO TLD VARIANTEN ===
    "https://fintutto.info",
    "https://fintutto.online",
    "https://fintutto.org",
    "https://fintutto.shop",
    "https://fintutto.site",
    "https://fintutto.space",
    "https://fintutto.store",
    # === SONSTIGE EXTERNE DOMAINS ===
    "https://vermitify.com",
    "https://vermitify.de",
    "https://zaehlerapp.de",
]

# Deduplizieren
URLS = list(dict.fromkeys(URLS))

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def check_ssl(hostname, port=443):
    """Prüft ob SSL-Zertifikat gültig ist."""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return True, cert.get("notAfter", "")
    except Exception as e:
        return False, str(e)[:100]


def check_url(url):
    """Prüft eine einzelne URL umfassend."""
    result = {
        "url": url,
        "status_code": "FAIL",
        "final_url": "",
        "redirect": "NO",
        "ssl_valid": "UNKNOWN",
        "ssl_expiry": "",
        "title": "",
        "meta_description": "",
        "google_analytics": "NO",
        "google_tag_manager": "NO",
        "og_tags": "NO",
        "og_title": "",
        "og_description": "",
        "og_image": "",
        "canonical": "",
        "robots_txt": "UNKNOWN",
        "sitemap_xml": "UNKNOWN",
        "h1": "",
        "lang": "",
        "viewport": "NO",
        "favicon": "NO",
        "notes": "",
        "category": categorize_url(url),
    }

    parsed = urlparse(url)
    hostname = parsed.hostname

    # SSL Check
    if parsed.scheme == "https" and hostname:
        ssl_ok, ssl_info = check_ssl(hostname)
        result["ssl_valid"] = "YES" if ssl_ok else "NO"
        result["ssl_expiry"] = ssl_info if ssl_ok else ""
        if not ssl_ok:
            result["notes"] += f"SSL: {ssl_info}; "

    # HTTP Request
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        result["status_code"] = str(resp.status_code)
        result["final_url"] = resp.url

        if resp.url != url:
            result["redirect"] = "YES"

        if resp.status_code == 200:
            html = resp.text
            soup = BeautifulSoup(html, "html.parser")

            # Title
            title_tag = soup.find("title")
            if title_tag:
                result["title"] = title_tag.get_text(strip=True)[:200]

            # Meta Description
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                result["meta_description"] = (meta_desc.get("content", ""))[:300]

            # Google Analytics
            if re.search(r"google-analytics|gtag|ga\.js|analytics\.js|G-[A-Z0-9]+|UA-\d+", html, re.I):
                result["google_analytics"] = "YES"

            # Google Tag Manager
            if re.search(r"googletagmanager|GTM-[A-Z0-9]+", html, re.I):
                result["google_tag_manager"] = "YES"

            # Open Graph Tags
            og_tags = soup.find_all("meta", attrs={"property": re.compile(r"^og:")})
            if og_tags:
                result["og_tags"] = "YES"
                for tag in og_tags:
                    prop = tag.get("property", "")
                    content = tag.get("content", "")
                    if prop == "og:title":
                        result["og_title"] = content[:200]
                    elif prop == "og:description":
                        result["og_description"] = content[:300]
                    elif prop == "og:image":
                        result["og_image"] = content[:300]

            # Canonical
            canonical = soup.find("link", attrs={"rel": "canonical"})
            if canonical:
                result["canonical"] = canonical.get("href", "")[:300]

            # H1
            h1 = soup.find("h1")
            if h1:
                result["h1"] = h1.get_text(strip=True)[:200]

            # Lang
            html_tag = soup.find("html")
            if html_tag:
                result["lang"] = html_tag.get("lang", "")

            # Viewport
            viewport = soup.find("meta", attrs={"name": "viewport"})
            if viewport:
                result["viewport"] = "YES"

            # Favicon
            favicon = soup.find("link", attrs={"rel": re.compile(r"icon", re.I)})
            if favicon:
                result["favicon"] = "YES"

        else:
            result["notes"] += f"HTTP {resp.status_code}; "

    except requests.exceptions.SSLError as e:
        result["notes"] += f"SSL Error: {str(e)[:100]}; "
        result["ssl_valid"] = "NO"
        # Retry without SSL verification
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True, verify=False)
            result["status_code"] = f"{resp.status_code} (SSL-Fehler)"
            result["final_url"] = resp.url
        except Exception:
            pass
    except requests.exceptions.ConnectionError as e:
        result["notes"] += "Verbindung fehlgeschlagen; "
    except requests.exceptions.Timeout:
        result["notes"] += "Timeout (15s); "
    except Exception as e:
        result["notes"] += f"Fehler: {str(e)[:100]}; "

    # robots.txt check (nur für Hauptdomains)
    if hostname and result["status_code"] not in ["FAIL"]:
        try:
            robots_url = f"{parsed.scheme}://{hostname}/robots.txt"
            r = requests.get(robots_url, headers=HEADERS, timeout=5)
            result["robots_txt"] = "YES" if r.status_code == 200 and len(r.text) > 10 else "NO"
        except Exception:
            result["robots_txt"] = "NO"

        # sitemap.xml check
        try:
            sitemap_url = f"{parsed.scheme}://{hostname}/sitemap.xml"
            r = requests.get(sitemap_url, headers=HEADERS, timeout=5)
            result["sitemap_xml"] = "YES" if r.status_code == 200 and "xml" in r.text[:200].lower() else "NO"
        except Exception:
            result["sitemap_xml"] = "NO"

    return result


def categorize_url(url):
    """Kategorisiert eine URL."""
    if "bescheidboxer" in url:
        if "/generator/" in url:
            return "BB-Generator"
        elif "/rechner/" in url:
            return "BB-Rechner"
        elif "BB_" in url:
            return "BB-Subdomain"
        elif "app.bescheidboxer" in url:
            return "BB-App"
        else:
            return "BB-Extern"
    elif "fintutto.cloud" in url:
        return "FT-Cloud"
    elif "fintutto.de" in url:
        if "app" in url:
            return "FT-App"
        elif "bundle" in url:
            return "FT-Bundle"
        elif "checker" in url:
            return "FT-Checker"
        elif "formular" in url:
            return "FT-Formular"
        elif "rechner" in url:
            return "FT-Rechner"
        else:
            return "FT-Sonstige"
    elif "fintutto." in url:
        return "FT-TLD-Variante"
    elif "vermitify" in url or "vermietify" in url:
        return "Vermietify"
    else:
        return "Externe-Domain"


def main():
    print(f"=" * 70)
    print(f"  FINTUTTO & BESCHEIDBOXER URL AUDIT")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  {len(URLS)} URLs zu prüfen (dedupliziert)")
    print(f"=" * 70)
    print()

    results = []
    total = len(URLS)

    with ThreadPoolExecutor(max_workers=15) as executor:
        future_to_url = {executor.submit(check_url, url): url for url in URLS}
        done = 0
        for future in as_completed(future_to_url):
            done += 1
            url = future_to_url[future]
            try:
                result = future.result()
                results.append(result)
                status = result["status_code"]
                symbol = "✓" if status == "200" else "✗" if status == "FAIL" else "~"
                print(f"  [{done}/{total}] {symbol} {status:>5}  {url}")
            except Exception as e:
                print(f"  [{done}/{total}] ✗ ERROR  {url}: {e}")
                results.append({"url": url, "status_code": "ERROR", "notes": str(e)})

    # Sort by category then URL
    results.sort(key=lambda r: (r.get("category", ""), r.get("url", "")))

    # === CSV Output ===
    csv_path = os.path.join(OUTPUT_DIR, "url_audit_results.csv")
    fieldnames = [
        "url", "category", "status_code", "final_url", "redirect", "ssl_valid", "ssl_expiry",
        "title", "meta_description", "h1", "lang", "google_analytics", "google_tag_manager",
        "og_tags", "og_title", "og_description", "og_image", "canonical",
        "viewport", "favicon", "robots_txt", "sitemap_xml", "notes"
    ]

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in results:
            writer.writerow(r)

    print(f"\nCSV gespeichert: {csv_path}")

    # === Markdown Report ===
    md_path = os.path.join(OUTPUT_DIR, "url_audit_report.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(f"# URL Audit Report\n\n")
        f.write(f"**Datum:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Geprüfte URLs:** {total}\n\n")

        # Summary
        ok = sum(1 for r in results if r.get("status_code") == "200")
        redirects = sum(1 for r in results if r.get("redirect") == "YES")
        fails = sum(1 for r in results if r.get("status_code") in ["FAIL", "ERROR"])
        errors = sum(1 for r in results if r.get("status_code", "").startswith(("4", "5")))

        f.write(f"## Zusammenfassung\n\n")
        f.write(f"| Status | Anzahl |\n")
        f.write(f"|--------|--------|\n")
        f.write(f"| Online (200) | {ok} |\n")
        f.write(f"| Redirects | {redirects} |\n")
        f.write(f"| HTTP Errors (4xx/5xx) | {errors} |\n")
        f.write(f"| Nicht erreichbar | {fails} |\n")
        f.write(f"| **Gesamt** | **{total}** |\n\n")

        # SEO Summary
        has_ga = sum(1 for r in results if r.get("google_analytics") == "YES")
        has_gtm = sum(1 for r in results if r.get("google_tag_manager") == "YES")
        has_og = sum(1 for r in results if r.get("og_tags") == "YES")
        has_canonical = sum(1 for r in results if r.get("canonical"))
        has_meta = sum(1 for r in results if r.get("meta_description"))
        has_title = sum(1 for r in results if r.get("title"))

        f.write(f"## SEO Übersicht (von {ok} erreichbaren Seiten)\n\n")
        f.write(f"| Merkmal | Vorhanden |\n")
        f.write(f"|---------|----------|\n")
        f.write(f"| Title Tag | {has_title} |\n")
        f.write(f"| Meta Description | {has_meta} |\n")
        f.write(f"| Google Analytics | {has_ga} |\n")
        f.write(f"| Google Tag Manager | {has_gtm} |\n")
        f.write(f"| Open Graph Tags | {has_og} |\n")
        f.write(f"| Canonical Tag | {has_canonical} |\n\n")

        # Probleme
        f.write(f"## Probleme\n\n")

        f.write(f"### Nicht erreichbare URLs\n\n")
        for r in results:
            if r.get("status_code") in ["FAIL", "ERROR"]:
                f.write(f"- {r['url']} - {r.get('notes', 'Keine Details')}\n")
        f.write("\n")

        f.write(f"### HTTP Errors\n\n")
        for r in results:
            sc = r.get("status_code", "")
            if sc.startswith(("4", "5")):
                f.write(f"- {r['url']} - HTTP {sc}\n")
        f.write("\n")

        f.write(f"### Fehlende SEO Tags (erreichbare Seiten)\n\n")
        for r in results:
            if r.get("status_code") == "200":
                issues = []
                if not r.get("title"):
                    issues.append("Kein Title")
                if not r.get("meta_description"):
                    issues.append("Keine Meta Description")
                if r.get("google_analytics") != "YES":
                    issues.append("Kein GA")
                if r.get("google_tag_manager") != "YES":
                    issues.append("Kein GTM")
                if r.get("og_tags") != "YES":
                    issues.append("Keine OG Tags")
                if not r.get("canonical"):
                    issues.append("Kein Canonical")
                if issues:
                    f.write(f"- {r['url']}: {', '.join(issues)}\n")
        f.write("\n")

        # Detailed table by category
        f.write(f"## Detail-Ergebnisse nach Kategorie\n\n")

        categories = sorted(set(r.get("category", "?") for r in results))
        for cat in categories:
            cat_results = [r for r in results if r.get("category") == cat]
            f.write(f"### {cat} ({len(cat_results)} URLs)\n\n")
            f.write(f"| URL | Status | Title | GA | GTM | OG | Canonical |\n")
            f.write(f"|-----|--------|-------|----|----|----|-----------|\n")
            for r in cat_results:
                title_short = (r.get("title", "") or "-")[:40]
                f.write(f"| {r['url']} | {r.get('status_code','-')} | {title_short} | {r.get('google_analytics','-')} | {r.get('google_tag_manager','-')} | {r.get('og_tags','-')} | {'YES' if r.get('canonical') else 'NO'} |\n")
            f.write("\n")

    print(f"Report gespeichert: {md_path}")

    # === JSON Output ===
    json_path = os.path.join(OUTPUT_DIR, "url_audit_results.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"JSON gespeichert: {json_path}")

    # === Print Summary ===
    print(f"\n{'=' * 70}")
    print(f"  ERGEBNIS-ZUSAMMENFASSUNG")
    print(f"{'=' * 70}")
    print(f"  Online (200):        {ok}")
    print(f"  Redirects:           {redirects}")
    print(f"  HTTP Errors:         {errors}")
    print(f"  Nicht erreichbar:    {fails}")
    print(f"  Google Analytics:    {has_ga} von {ok}")
    print(f"  Google Tag Manager:  {has_gtm} von {ok}")
    print(f"  OG Tags:             {has_og} von {ok}")
    print(f"  Meta Description:    {has_meta} von {ok}")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
