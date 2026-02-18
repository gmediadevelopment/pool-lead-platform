<?php
/**
 * Plugin Name: PoolbauVergleich Planer
 * Description: Ein interaktiver Kostenrechner und Lead-Magnet für Pool-Interessenten. Nutzung via Shortcode [pool_planer].
 * Version: 3.0 (Direct Webhook - No Google Sheets)
 * Author: Gemini
 */

if (!defined('ABSPATH')) {
    exit;
}

// === KONFIGURATION ===
// Trage hier die URL deines Marktplatzes und den Webhook-Secret ein:
define('POOL_WEBHOOK_URL', 'https://marktplatz.poolbau-vergleich.de/api/leads/webhook');
define('POOL_WEBHOOK_SECRET', 'DEIN_WEBHOOK_SECRET_HIER'); // Muss mit WEBHOOK_SECRET in Hostinger übereinstimmen

// 1. Shortcode registrieren
function pool_planer_shortcode() {
    return '<div id="pool-planer-root" style="min-height: 600px; width: 100%; display:flex; flex-direction:column; justify-content:center; align-items:center; color:#666; font-family:sans-serif;">
                <div style="margin-bottom: 10px;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>
                <div>Lade Pool-Planer...</div>
            </div>';
}
add_shortcode('pool_planer', 'pool_planer_shortcode');

// 2. AJAX Handler für Lead-Übermittlung (serverseitig - sicherer)
function pool_planer_submit_lead() {
    // Nonce prüfen
    check_ajax_referer('pool_planer_nonce', 'nonce');

    $data = array(
        'firstName'       => sanitize_text_field($_POST['firstName'] ?? ''),
        'lastName'        => sanitize_text_field($_POST['lastName'] ?? ''),
        'email'           => sanitize_email($_POST['email'] ?? ''),
        'phone'           => sanitize_text_field($_POST['phone'] ?? ''),
        'zip'             => sanitize_text_field($_POST['zip'] ?? ''),
        'poolType'        => sanitize_text_field($_POST['poolType'] ?? ''),
        'installation'    => sanitize_text_field($_POST['installation'] ?? ''),
        'dimensions'      => sanitize_text_field($_POST['dimensions'] ?? ''),
        'extras'          => sanitize_text_field($_POST['extras'] ?? ''),
        'priceEstimate'   => sanitize_text_field($_POST['priceEstimate'] ?? ''),
        'timeframe'       => sanitize_text_field($_POST['timeframe'] ?? ''),
        'budgetConfirmed' => sanitize_text_field($_POST['budgetConfirmed'] ?? ''),
        'status'          => sanitize_text_field($_POST['status'] ?? 'Interessent (Nur Berechnung)'),
    );

    // Validierung
    if (empty($data['firstName']) || empty($data['email']) || empty($data['zip'])) {
        wp_send_json_error('Pflichtfelder fehlen');
        return;
    }

    // An Marktplatz-Webhook senden
    $response = wp_remote_post(POOL_WEBHOOK_URL, array(
        'method'  => 'POST',
        'timeout' => 15,
        'headers' => array(
            'Content-Type'     => 'application/json',
            'x-webhook-secret' => POOL_WEBHOOK_SECRET,
        ),
        'body' => json_encode($data),
    ));

    if (is_wp_error($response)) {
        error_log('Pool Planer Webhook Error: ' . $response->get_error_message());
        wp_send_json_error('Webhook-Fehler: ' . $response->get_error_message());
        return;
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status_code === 200 && isset($body['success']) && $body['success']) {
        wp_send_json_success(array('leadId' => $body['leadId'] ?? null));
    } else {
        error_log('Pool Planer Webhook Response: ' . wp_remote_retrieve_body($response));
        wp_send_json_error('Marktplatz-Fehler: ' . ($body['error'] ?? 'Unbekannter Fehler'));
    }
}
add_action('wp_ajax_pool_planer_submit', 'pool_planer_submit_lead');
add_action('wp_ajax_nopriv_pool_planer_submit', 'pool_planer_submit_lead');

// 3. Skripte laden
function pool_planer_enqueue_libs() {
    wp_enqueue_script('pp-react', 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', [], '18.2.0', true);
    wp_enqueue_script('pp-react-dom', 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js', ['pp-react'], '18.2.0', true);
    wp_enqueue_script('pp-babel', 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js', [], '7.23.5', true);
    wp_enqueue_script('pp-tailwind', 'https://cdn.tailwindcss.com', [], '3.4.1', false);

    // AJAX URL und Nonce für JavaScript verfügbar machen
    wp_localize_script('pp-react', 'poolPlanerConfig', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('pool_planer_nonce'),
    ));

    add_action('wp_footer', 'pool_planer_print_app_script', 9999);
}
add_action('wp_enqueue_scripts', 'pool_planer_enqueue_libs');

// 4. React App ausgeben (mit WordPress AJAX statt direktem Google Sheets Aufruf)
function pool_planer_print_app_script() {
    ?>
    <script>
        tailwind.config = {
            important: '#pool-planer-root',
            corePlugins: { preflight: false }
        }
    </script>

    <script type="text/babel" data-presets="react">
        const { useState, useEffect, useRef, Component } = React;

        // === AJAX Submit (über WordPress Backend - sicher) ===
        const submitToMarktplatz = async (data) => {
            const formData = new FormData();
            formData.append('action', 'pool_planer_submit');
            formData.append('nonce', poolPlanerConfig.nonce);
            
            for (const key in data) {
                formData.append(key, data[key]);
            }

            const response = await fetch(poolPlanerConfig.ajaxUrl, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.data || 'Fehler beim Senden');
            }
            return result.data;
        };

        // GTM Tracking
        const pushToDataLayer = (eventName, userData) => {
            if (window.dataLayer) {
                window.dataLayer.push({
                    'event': eventName,
                    'user_data': {
                        'email': userData.email,
                        'phone_number': userData.phone,
                        'address': {
                            'first_name': userData.firstName,
                            'last_name': userData.lastName,
                            'postal_code': userData.zip,
                            'country': 'DE'
                        }
                    }
                });
            }
        };

        <?php
        // Hier kommt der Rest des React-App-Codes (Icons, Komponenten etc.)
        // Der Code ist identisch mit dem Original-Plugin, nur submitToGoogleSheet
        // wurde durch submitToMarktplatz ersetzt.
        // Füge hier den kompletten React-Code aus dem Original-Plugin ein,
        // und ersetze alle Aufrufe von submitToGoogleSheet() mit submitToMarktplatz()
        ?>

        // WICHTIG: Kopiere hier den gesamten React-Code aus dem Original-Plugin
        // und ersetze nur diese zwei Stellen:
        //   1. submitToGoogleSheet(sheetData) → await submitToMarktplatz(sheetData)
        //   2. Entferne die GOOGLE_SHEET_URL Konstante

    </script>
    <?php
}
