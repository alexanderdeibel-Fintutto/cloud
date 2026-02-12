/**
 * ============================================================
 * FINTUTTO URL CHECKER - Google Apps Script
 * ============================================================
 *
 * ANLEITUNG:
 * 1. Öffne deine Google Sheet
 * 2. Menü: Erweiterungen > Apps Script
 * 3. Lösche den bestehenden Code und füge diesen Code ein
 * 4. Speichere (Strg+S)
 * 5. Führe die Funktion "checkAllUrls" aus (Play-Button)
 * 6. Bei der ersten Ausführung: Google-Berechtigungen bestätigen
 *
 * WAS ES MACHT:
 * - Liest alle URLs aus der Sheet (Spalte mit URLs)
 * - Prüft jede URL auf Erreichbarkeit (HTTP Status)
 * - Schreibt Ergebnisse in zusätzliche Spalten D-H
 * - Formatiert alles schön mit Farben, Rahmen, Spaltenbreiten
 * ============================================================
 */

// === KONFIGURATION ===
// Passe URL_COLUMN an, falls deine URLs nicht in Spalte C stehen
var CONFIG = {
  URL_COLUMN: 3,        // Spalte C = URLs (1=A, 2=B, 3=C, etc.)
  STATUS_COLUMN: 4,     // Spalte D = online/offline Status
  HTTP_CODE_COLUMN: 5,  // Spalte E = HTTP Status Code
  REDIRECT_COLUMN: 6,   // Spalte F = Redirect-Ziel
  GA_GTM_COLUMN: 7,     // Spalte G = Google Analytics / GTM
  TITLE_COLUMN: 8,      // Spalte H = Page Title
  START_ROW: 2,         // Ab Zeile 2 (Zeile 1 = Header)
  SHEET_NAME: "",       // Leer = erstes Sheet, oder "Sheet1" etc.
  TIMEOUT: 15000,       // Timeout in Millisekunden
};

/**
 * Hauptfunktion: Prüft alle URLs und schreibt Ergebnisse
 */
function checkAllUrls() {
  var sheet = CONFIG.SHEET_NAME
    ? SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME)
    : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var lastRow = sheet.getLastRow();

  if (lastRow < CONFIG.START_ROW) {
    SpreadsheetApp.getUi().alert("Keine Daten gefunden ab Zeile " + CONFIG.START_ROW);
    return;
  }

  // Header & Formatting einrichten
  formatHeaders(sheet);

  var urls = sheet.getRange(CONFIG.START_ROW, CONFIG.URL_COLUMN, lastRow - CONFIG.START_ROW + 1, 1).getValues();

  Logger.log("Prüfe " + urls.length + " URLs...");

  for (var i = 0; i < urls.length; i++) {
    var url = urls[i][0];
    var row = CONFIG.START_ROW + i;

    if (!url || url.toString().trim() === "") {
      continue;
    }

    url = cleanUrl(url.toString().trim());

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    Logger.log("[" + (i + 1) + "/" + urls.length + "] Prüfe: " + url);

    var result = checkSingleUrl(url);

    // Ergebnisse schreiben + formatieren
    formatResultRow(sheet, row, result);

    // Rate Limiting - Google hat ein Limit von ~20 Requests/Min
    if (i % 10 === 9) {
      Utilities.sleep(2000);
    }
  }

  Logger.log("Fertig! " + urls.length + " URLs geprüft.");
  SpreadsheetApp.getUi().alert("Fertig! " + urls.length + " URLs geprüft.\nErgebnisse stehen in Spalten D-H.");
}

/**
 * Prüft eine einzelne URL
 */
function checkSingleUrl(url) {
  var result = {
    status: "offline",
    httpCode: "",
    redirectUrl: "",
    gaGtm: "",
    title: "",
  };

  try {
    var options = {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    };

    // Erst ohne Redirect folgen, um Redirects zu erkennen
    var optionsNoRedirect = {
      muteHttpExceptions: true,
      followRedirects: false,
      validateHttpsCertificates: false,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    };

    var firstResponse = UrlFetchApp.fetch(url, optionsNoRedirect);
    var firstCode = firstResponse.getResponseCode();

    // Redirect erkennen
    if (firstCode >= 300 && firstCode < 400) {
      var location = firstResponse.getHeaders()["Location"] || firstResponse.getHeaders()["location"] || "";
      result.redirectUrl = location;
    }

    // Jetzt mit Redirect folgen für Content-Analyse
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    result.httpCode = code;

    if (code === 200) {
      result.status = "online";
      var html = response.getContentText();

      // Title extrahieren
      var titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) {
        result.title = titleMatch[1].trim().substring(0, 200);
      }

      // Google Analytics / GTM prüfen
      var gaGtmParts = [];
      if (html.match(/google-analytics|gtag|analytics\.js|G-[A-Z0-9]+|UA-\d+/i)) {
        gaGtmParts.push("GA");
      }
      if (html.match(/googletagmanager|GTM-[A-Z0-9]+/i)) {
        gaGtmParts.push("GTM");
      }
      result.gaGtm = gaGtmParts.length > 0 ? gaGtmParts.join("+") : "NEIN";

    } else if (code >= 300 && code < 400) {
      result.status = "redirect";
    } else if (code === 403) {
      result.status = "gesperrt (403)";
    } else if (code === 404) {
      result.status = "nicht gefunden (404)";
    } else if (code >= 500) {
      result.status = "server error (" + code + ")";
    } else {
      result.status = "error (" + code + ")";
    }

    // Wenn redirect + 200 am Ende
    if (result.redirectUrl && code === 200) {
      result.status = "online (redirect)";
    }

  } catch (e) {
    result.status = "offline";
    result.httpCode = "FAIL";
    result.title = e.message ? e.message.substring(0, 100) : "Verbindung fehlgeschlagen";
  }

  return result;
}

/**
 * Formatiert Header-Zeile und Spalten schön
 */
function formatHeaders(sheet) {
  var headers = [
    { col: CONFIG.STATUS_COLUMN,    label: "Status",     width: 140 },
    { col: CONFIG.HTTP_CODE_COLUMN, label: "HTTP Code",  width: 90  },
    { col: CONFIG.REDIRECT_COLUMN,  label: "Redirect →", width: 250 },
    { col: CONFIG.GA_GTM_COLUMN,    label: "GA / GTM",   width: 90  },
    { col: CONFIG.TITLE_COLUMN,     label: "Page Title",  width: 300 },
  ];

  for (var i = 0; i < headers.length; i++) {
    var h = headers[i];
    var cell = sheet.getRange(1, h.col);
    cell.setValue(h.label)
        .setFontWeight("bold")
        .setFontSize(10)
        .setBackground("#4a86c8")
        .setFontColor("#ffffff")
        .setHorizontalAlignment("center")
        .setBorder(true, true, true, true, false, false, "#3a6ea5", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
    sheet.setColumnWidth(h.col, h.width);
  }

  // Header-Zeile einfrieren
  sheet.setFrozenRows(1);

  // Auch bestehende Spalten A-C etwas aufhübschen
  var headerRow = sheet.getRange(1, 1, 1, CONFIG.URL_COLUMN);
  headerRow.setFontWeight("bold").setFontSize(10);
}

/**
 * Formatiert eine Ergebnis-Zeile mit Farben und Rahmen
 */
function formatResultRow(sheet, row, result) {
  var statusCell = sheet.getRange(row, CONFIG.STATUS_COLUMN);
  var httpCell = sheet.getRange(row, CONFIG.HTTP_CODE_COLUMN);
  var redirectCell = sheet.getRange(row, CONFIG.REDIRECT_COLUMN);
  var gaCell = sheet.getRange(row, CONFIG.GA_GTM_COLUMN);
  var titleCell = sheet.getRange(row, CONFIG.TITLE_COLUMN);

  // Werte setzen
  statusCell.setValue(result.status);
  httpCell.setValue(result.httpCode);
  redirectCell.setValue(result.redirectUrl);
  gaCell.setValue(result.gaGtm);
  titleCell.setValue(result.title);

  // Status-Farbe (Zelle + Schrift)
  var colors = getStatusColors(result.status);
  statusCell.setBackground(colors.bg)
            .setFontColor(colors.fg)
            .setFontWeight("bold")
            .setHorizontalAlignment("center");

  // HTTP Code Farbe
  var codeColors = getCodeColors(result.httpCode);
  httpCell.setBackground(codeColors.bg)
          .setFontColor(codeColors.fg)
          .setHorizontalAlignment("center")
          .setFontFamily("Roboto Mono");

  // GA/GTM Farbe
  if (result.gaGtm === "NEIN") {
    gaCell.setBackground("#fce8b2").setFontColor("#7f6003").setHorizontalAlignment("center");
  } else if (result.gaGtm) {
    gaCell.setBackground("#b7e1cd").setFontColor("#0d652d").setHorizontalAlignment("center").setFontWeight("bold");
  }

  // Redirect URL dezent
  if (result.redirectUrl) {
    redirectCell.setFontColor("#666666").setFontSize(9);
  }

  // Title dezent
  if (result.title) {
    titleCell.setFontColor("#333333").setFontSize(9);
  }

  // Dünner Rahmen um alle Ergebnis-Zellen
  var fullRow = sheet.getRange(row, CONFIG.STATUS_COLUMN, 1, 5);
  fullRow.setBorder(null, null, true, null, null, null, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Gibt Hintergrund + Schriftfarbe für Status zurück
 */
function getStatusColors(status) {
  if (status === "online")
    return { bg: "#b7e1cd", fg: "#0d652d" };
  if (status.indexOf("online") >= 0)
    return { bg: "#d9ead3", fg: "#274e13" };
  if (status === "offline")
    return { bg: "#f4c7c3", fg: "#a61c00" };
  if (status.indexOf("redirect") >= 0)
    return { bg: "#fce8b2", fg: "#7f6003" };
  if (status.indexOf("404") >= 0)
    return { bg: "#f4c7c3", fg: "#a61c00" };
  if (status.indexOf("403") >= 0)
    return { bg: "#fce8b2", fg: "#7f6003" };
  if (status.indexOf("error") >= 0)
    return { bg: "#f4c7c3", fg: "#a61c00" };
  return { bg: "#ffffff", fg: "#000000" };
}

/**
 * Gibt Farben für HTTP Code zurück
 */
function getCodeColors(code) {
  if (code === 200)   return { bg: "#e6f4ea", fg: "#137333" };
  if (code >= 300 && code < 400) return { bg: "#fef7e0", fg: "#7f6003" };
  if (code >= 400 && code < 500) return { bg: "#fce8e6", fg: "#a61c00" };
  if (code >= 500)    return { bg: "#fce8e6", fg: "#a61c00" };
  if (code === "FAIL") return { bg: "#f4c7c3", fg: "#a61c00" };
  return { bg: "#ffffff", fg: "#666666" };
}

/**
 * Bereinigt URL-String
 */
function cleanUrl(url) {
  // Anführungszeichen entfernen
  url = url.replace(/^["'\s]+|["'\s]+$/g, "");
  // Trailing Slash normalisieren
  return url;
}

/**
 * Menü hinzufügen
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("URL Checker")
    .addItem("Alle URLs prüfen", "checkAllUrls")
    .addItem("Nur Spalte D (Status) prüfen", "checkStatusOnly")
    .addSeparator()
    .addItem("Hilfe", "showHelp")
    .addToUi();
}

/**
 * Nur Status prüfen (schneller, kein Content-Check)
 */
function checkStatusOnly() {
  var sheet = CONFIG.SHEET_NAME
    ? SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME)
    : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var lastRow = sheet.getLastRow();
  var urls = sheet.getRange(CONFIG.START_ROW, CONFIG.URL_COLUMN, lastRow - CONFIG.START_ROW + 1, 1).getValues();

  sheet.getRange(1, CONFIG.STATUS_COLUMN).setValue("Status");

  for (var i = 0; i < urls.length; i++) {
    var url = urls[i][0];
    var row = CONFIG.START_ROW + i;

    if (!url || url.toString().trim() === "") continue;

    url = cleanUrl(url.toString().trim());
    if (!url.startsWith("http")) url = "https://" + url;

    try {
      var response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        followRedirects: true,
        validateHttpsCertificates: false,
        headers: {"User-Agent": "Mozilla/5.0"}
      });
      var code = response.getResponseCode();

      if (code === 200) {
        sheet.getRange(row, CONFIG.STATUS_COLUMN).setValue("online").setBackground("#b7e1cd");
      } else if (code >= 300 && code < 400) {
        sheet.getRange(row, CONFIG.STATUS_COLUMN).setValue("redirect").setBackground("#fce8b2");
      } else {
        sheet.getRange(row, CONFIG.STATUS_COLUMN).setValue("offline (" + code + ")").setBackground("#f4c7c3");
      }
    } catch (e) {
      sheet.getRange(row, CONFIG.STATUS_COLUMN).setValue("offline").setBackground("#f4c7c3");
    }

    if (i % 10 === 9) Utilities.sleep(2000);
  }

  SpreadsheetApp.getUi().alert("Fertig! Status für " + urls.length + " URLs geprüft.");
}

/**
 * Hilfe-Dialog
 */
function showHelp() {
  var html = HtmlService.createHtmlOutput(
    "<h3>URL Checker - Hilfe</h3>" +
    "<p><b>Konfiguration:</b></p>" +
    "<ul>" +
    "<li>URLs werden aus Spalte C gelesen (anpassbar in CONFIG)</li>" +
    "<li>Ergebnisse werden in Spalten D-H geschrieben</li>" +
    "<li>Ab Zeile 2 (Zeile 1 = Header)</li>" +
    "</ul>" +
    "<p><b>Funktionen:</b></p>" +
    "<ul>" +
    "<li><b>Alle URLs prüfen:</b> Vollständiger Check mit GA/GTM und Title</li>" +
    "<li><b>Nur Status prüfen:</b> Schneller Check - nur online/offline</li>" +
    "</ul>" +
    "<p><b>Status-Farben:</b></p>" +
    "<ul>" +
    "<li style='background:#b7e1cd'>Grün = online</li>" +
    "<li style='background:#fce8b2'>Gelb = redirect</li>" +
    "<li style='background:#f4c7c3'>Rot = offline/error</li>" +
    "</ul>"
  ).setWidth(400).setHeight(350);
  SpreadsheetApp.getUi().showModalDialog(html, "URL Checker Hilfe");
}
