<?php
/**
 * Plugin Name: PoolbauVergleich Planer
 * Description: Interaktiver Pool-Kostenrechner mit direkter Lead-Übermittlung an den Marktplatz. Shortcode: [pool_planer]
 * Version: 3.0
 * Author: PoolbauVergleich
 */

if (!defined('ABSPATH'))
    exit;

// === KONFIGURATION ===
define('POOL_WEBHOOK_URL', 'https://marktplatz.poolbau-vergleich.de/api/leads/webhook');
define('POOL_WEBHOOK_SECRET', 'pool-webhook-secret-2024');

// 1. Shortcode
function pool_planer_shortcode()
{
    return '<div id="pool-planer-root"></div>';
}
add_shortcode('pool_planer', 'pool_planer_shortcode');

// 2. AJAX Handler (serverseitig – sicher, kein Secret im Frontend)
function pool_planer_submit_lead()
{
    check_ajax_referer('pool_planer_nonce', 'nonce');

    $data = array(
        'firstName' => sanitize_text_field($_POST['firstName'] ?? ''),
        'lastName' => sanitize_text_field($_POST['lastName'] ?? ''),
        'email' => sanitize_email($_POST['email'] ?? ''),
        'phone' => sanitize_text_field($_POST['phone'] ?? ''),
        'zip' => sanitize_text_field($_POST['zip'] ?? ''),
        'poolType' => sanitize_text_field($_POST['poolType'] ?? ''),
        'installation' => sanitize_text_field($_POST['installation'] ?? ''),
        'dimensions' => sanitize_text_field($_POST['dimensions'] ?? ''),
        'extras' => sanitize_text_field($_POST['extras'] ?? ''),
        'priceEstimate' => sanitize_text_field($_POST['priceEstimate'] ?? ''),
        'timeframe' => sanitize_text_field($_POST['timeframe'] ?? ''),
        'budgetConfirmed' => sanitize_text_field($_POST['budgetConfirmed'] ?? 'no'),
        'status' => sanitize_text_field($_POST['status'] ?? 'Interessent (Nur Berechnung)'),
    );

    if (empty($data['firstName']) || empty($data['email']) || empty($data['zip'])) {
        wp_send_json_error('Pflichtfelder fehlen');
        return;
    }

    $response = wp_remote_post(POOL_WEBHOOK_URL, array(
        'method' => 'POST',
        'timeout' => 15,
        'headers' => array(
            'Content-Type' => 'application/json',
            'x-webhook-secret' => POOL_WEBHOOK_SECRET,
        ),
        'body' => json_encode($data),
    ));

    if (is_wp_error($response)) {
        error_log('Pool Planer Webhook Error: ' . $response->get_error_message());
        wp_send_json_error('Verbindungsfehler: ' . $response->get_error_message());
        return;
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status_code === 200 && !empty($body['success'])) {
        wp_send_json_success(array('leadId' => $body['leadId'] ?? null, 'action' => $body['action'] ?? 'created'));
    }
    else {
        error_log('Pool Planer Webhook Response (' . $status_code . '): ' . wp_remote_retrieve_body($response));
        wp_send_json_error($body['error'] ?? 'Unbekannter Fehler');
    }
}
add_action('wp_ajax_pool_planer_submit', 'pool_planer_submit_lead');
add_action('wp_ajax_nopriv_pool_planer_submit', 'pool_planer_submit_lead');

// 3. Skripte & Styles laden
function pool_planer_enqueue()
{
    wp_enqueue_script('pp-react', 'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', [], '18.2.0', true);
    wp_enqueue_script('pp-react-dom', 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js', ['pp-react'], '18.2.0', true);
    wp_enqueue_script('pp-babel', 'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js', [], '7.23.5', true);
    wp_enqueue_script('pp-tailwind', 'https://cdn.tailwindcss.com', [], null, false);

    wp_localize_script('pp-react', 'poolPlanerConfig', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('pool_planer_nonce'),
    ));

    add_action('wp_footer', 'pool_planer_render_app', 9999);
}
add_action('wp_enqueue_scripts', 'pool_planer_enqueue');

// 4. React App
function pool_planer_render_app()
{
?>
<script>
if (typeof tailwind !== 'undefined') {
    tailwind.config = { important: '#pool-planer-root', corePlugins: { preflight: false } };
}
</script>
<script type="text/babel" data-presets="react">
const { useState } = React;

// ── Hilfsfunktionen ──────────────────────────────────────────────
const submitLead = async (data) => {
    const fd = new FormData();
    fd.append('action', 'pool_planer_submit');
    fd.append('nonce', poolPlanerConfig.nonce);
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    const res = await fetch(poolPlanerConfig.ajaxUrl, { method: 'POST', body: fd });
    const json = await res.json();
    if (!json.success) throw new Error(json.data || 'Fehler beim Senden');
    // Call submitToMarketplace here as requested
    await submitToMarketplace(data); // Assuming data is the correct payload for marketplace
    return json.data;
};

const pushGTM = (event, d) => {
    if (window.dataLayer) window.dataLayer.push({
        event,
        user_data: {
            email: d.email,
            phone_number: d.phone,
            address: { first_name: d.firstName, last_name: d.lastName, postal_code: d.zip, country: 'DE' }
        }
    });
};

// --- Helper: Send to Marketplace ---
const submitToMarketplace = async (data) => {
    // This function is a placeholder based on the user's provided snippet.
    // The actual implementation details (e.g., URL, secret, specific payload)
    // would need to be defined if this were a separate client-side call.
    // For now, it's an empty async function to satisfy the call in submitLead.
    // In a typical WordPress setup, the server-side `pool_planer_submit_lead`
    // function already handles the webhook to the marketplace.
    // If this is intended for a *different* marketplace or client-side call,
    // its implementation needs to be completed.
    console.log("submitToMarketplace called with data:", data);
    // Example of what it *might* look like if it were a separate client-side call:
    /*
    try {
        // Assuming poolPlanerConfig has marketplace specific details if needed
        const marketplaceUrl = 'https://marktplatz.poolbau-vergleich.de/api/leads/client-webhook'; // Example client-side endpoint
        const response = await fetch(marketplaceUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'x-client-secret': 'some-client-secret' // If a client-side secret is used
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit to marketplace');
        }
        console.log('Submitted to marketplace:', result);
    } catch(e) {
        console.error('Marktplatz webhook error:', e);
    }
    */
};

// ── Preisberechnung ──────────────────────────────────────────────
const PREISE = {
    poolType: { Stahlwandpool: [3000,6000], Betonpool: [15000,40000], GFK_Fertigpool: [8000,20000], Naturpool: [12000,30000] },
    installation: { Einbaupool: [2000,5000], Aufstellpool: [0,500], Halbeinbau: [1000,3000] },
    dimensions: {
        'Klein (bis 3x5m)': [0,0], 'Mittel (3x6m)': [1000,3000],
        'Groß (4x8m)': [3000,8000], 'XL (5x10m+)': [8000,20000]
    },
    extras: { Heizung: [800,2000], Gegenstromanlage: [1500,4000], Überdachung: [3000,12000], Beleuchtung: [500,1500], Automatik: [1000,3000] }
};

const berechnePreis = (form) => {
    let min = 0, max = 0;
    const add = (obj, key) => { if (obj[key]) { min += obj[key][0]; max += obj[key][1]; } };
    add(PREISE.poolType, form.poolType);
    add(PREISE.installation, form.installation);
    add(PREISE.dimensions, form.dimensions);
    (form.extras || []).forEach(e => add(PREISE.extras, e));
    return { min, max, avg: Math.round((min + max) / 2) };
};

const fmt = (n) => n.toLocaleString('de-DE') + ' €';

// ── Schritte ─────────────────────────────────────────────────────
const SCHRITTE = [
    { id: 'poolType',     label: 'Pool-Typ',        frage: 'Welchen Pool-Typ möchten Sie?',
      optionen: ['Stahlwandpool','Betonpool','GFK_Fertigpool','Naturpool'],
      labels: { Stahlwandpool: 'Stahlwandpool', Betonpool: 'Betonpool (gemauert)', GFK_Fertigpool: 'GFK Fertigpool', Naturpool: 'Naturpool / Schwimmteich' },
      icons: { Stahlwandpool: '🏊', Betonpool: '🏗️', GFK_Fertigpool: '✨', Naturpool: '🌿' }
    },
    { id: 'installation', label: 'Einbauart',       frage: 'Wie soll der Pool eingebaut werden?',
      optionen: ['Einbaupool','Aufstellpool','Halbeinbau'],
      labels: { Einbaupool: 'Einbaupool (versenkt)', Aufstellpool: 'Aufstellpool', Halbeinbau: 'Halbeinbau' },
      icons: { Einbaupool: '⬇️', Aufstellpool: '⬆️', Halbeinbau: '↕️' }
    },
    { id: 'dimensions',   label: 'Größe',           frage: 'Welche Größe soll der Pool haben?',
      optionen: ['Klein (bis 3x5m)','Mittel (3x6m)','Groß (4x8m)','XL (5x10m+)'],
      labels: null, icons: { 'Klein (bis 3x5m)': '🔹', 'Mittel (3x6m)': '🔷', 'Groß (4x8m)': '💠', 'XL (5x10m+)': '🔵' }
    },
    { id: 'extras',       label: 'Extras',          frage: 'Welche Extras wünschen Sie? (Mehrfachauswahl)',
      optionen: ['Heizung','Gegenstromanlage','Überdachung','Beleuchtung','Automatik'],
      icons: { Heizung: '🌡️', Gegenstromanlage: '🌊', Überdachung: '🏠', Beleuchtung: '💡', Automatik: '🤖' },
      mehrfach: true
    },
    { id: 'timeframe',    label: 'Zeitplan',        frage: 'Wann möchten Sie bauen?',
      optionen: ['So schnell wie möglich','In 3-6 Monaten','In 6-12 Monaten','Noch nicht sicher'],
      icons: { 'So schnell wie möglich': '⚡', 'In 3-6 Monaten': '📅', 'In 6-12 Monaten': '🗓️', 'Noch nicht sicher': '🤔' }
    },
];

// ── Komponenten ───────────────────────────────────────────────────
const ProgressBar = ({ step, total }) => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-500"
             style={{ width: `${(step / total) * 100}%` }} />
    </div>
);

const OptionCard = ({ label, icon, selected, onClick }) => (
    <button onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center w-full
            ${selected ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
        <span className="text-3xl mb-2">{icon}</span>
        <span className={`text-sm font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{label}</span>
        {selected && <span className="mt-1 text-blue-600 text-xs">✓ Ausgewählt</span>}
    </button>
);

const PreisAnzeige = ({ preis }) => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 mb-6 shadow-lg">
        <p className="text-blue-200 text-sm mb-1">Geschätzte Kosten</p>
        <p className="text-3xl font-bold">{fmt(preis.min)} – {fmt(preis.max)}</p>
        <p className="text-blue-200 text-sm mt-1">Ø ca. {fmt(preis.avg)}</p>
    </div>
);

// ── Formular-Schritt ──────────────────────────────────────────────
const FormularSchritt = ({ form, setForm, preis, onSubmit, loading, submitted }) => {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.firstName?.trim()) e.firstName = 'Pflichtfeld';
        if (!form.lastName?.trim()) e.lastName = 'Pflichtfeld';
        if (!form.email?.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Gültige E-Mail erforderlich';
        if (!form.zip?.trim() || !/^\d{5}$/.test(form.zip)) e.zip = '5-stellige PLZ erforderlich';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onSubmit('Interessent (Nur Berechnung)');
    };

    if (submitted) return (
        <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ihre Berechnung ist bereit!</h3>
            <PreisAnzeige preis={preis} />
            <p className="text-gray-600 mb-6">Möchten Sie ein kostenloses Beratungsgespräch mit einem unserer Pool-Experten?</p>
            <button onClick={() => onSubmit('Beratung angefragt')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors disabled:opacity-50">
                {loading ? '⏳ Wird gesendet...' : '📞 Ja, Beratung anfragen!'}
            </button>
            <p className="text-xs text-gray-400 mt-3">Kostenlos & unverbindlich</p>
        </div>
    );

    const inp = (field) => ({
        value: form[field] || '',
        onChange: (e) => setForm(p => ({ ...p, [field]: e.target.value })),
        className: `w-full border rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`
    });

    return (
        <div>
            <PreisAnzeige preis={preis} />
            <h3 className="text-xl font-bold text-gray-800 mb-4">Berechnung anzeigen</h3>
            <p className="text-gray-500 text-sm mb-4">Geben Sie Ihre Kontaktdaten ein um die detaillierte Berechnung zu erhalten.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input {...inp('firstName')} placeholder="Vorname *" />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <input {...inp('lastName')} placeholder="Nachname *" />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                </div>
                <div>
                    <input {...inp('email')} placeholder="E-Mail *" type="email" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <input {...inp('zip')} placeholder="PLZ *" maxLength={5} />
                        {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                    </div>
                    <div>
                        <input {...inp('phone')} placeholder="Telefon (optional)" type="tel" />
                    </div>
                </div>
                <div className="flex items-start gap-2 mt-2">
                    <input type="checkbox" id="pp-budget" checked={!!form.budgetConfirmed}
                        onChange={e => setForm(p => ({ ...p, budgetConfirmed: e.target.checked }))}
                        className="mt-1" />
                    <label htmlFor="pp-budget" className="text-xs text-gray-500">
                        Ich habe ein Budget von mindestens {fmt(preis.min)} eingeplant und bin ernsthaft an einem Pool interessiert.
                    </label>
                </div>
                <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors disabled:opacity-50 mt-2">
                    {loading ? '⏳ Wird berechnet...' : '🔍 Kostenlose Berechnung anzeigen'}
                </button>
                <p className="text-xs text-gray-400 text-center">Ihre Daten werden vertraulich behandelt. Kein Spam.</p>
            </form>
        </div>
    );
};

// ── Haupt-App ─────────────────────────────────────────────────────
const PoolPlaner = () => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ extras: [] });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [beratungDone, setBeratungDone] = useState(false);
    const [error, setError] = useState('');

    const aktuellerSchritt = SCHRITTE[step];
    const preis = berechnePreis(form);
    const istFormularSchritt = step === SCHRITTE.length;

    const waehlen = (wert) => {
        if (aktuellerSchritt.mehrfach) {
            setForm(p => {
                const arr = p.extras || [];
                return { ...p, extras: arr.includes(wert) ? arr.filter(x => x !== wert) : [...arr, wert] };
            });
        } else {
            setForm(p => ({ ...p, [aktuellerSchritt.id]: wert }));
            setTimeout(() => setStep(s => s + 1), 300);
        }
    };

    const handleSubmit = async (status) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...form,
                extras: (form.extras || []).join(', '),
                budgetConfirmed: form.budgetConfirmed ? 'yes' : 'no',
                priceEstimate: `${fmt(preis.min)} - ${fmt(preis.max)}`,
                status,
            };
            await submitLead(payload);
            pushGTM(status === 'Beratung angefragt' ? 'pool_consultation_requested' : 'pool_lead_created', form);

            if (status === 'Beratung angefragt') {
                setBeratungDone(true);
            } else {
                setSubmitted(true);
            }
        } catch (e) {
            setError(e.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        } finally {
            setLoading(false);
        }
    };

    if (beratungDone) return (
        <div className="max-w-lg mx-auto p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Beratung angefragt!</h3>
            <p className="text-gray-600">Wir melden uns innerhalb von 24 Stunden bei Ihnen. Vielen Dank!</p>
        </div>
    );

    return (
        <div className="max-w-lg mx-auto font-sans">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-6">
                    <h2 className="text-2xl font-bold mb-1">🏊 Pool-Kostenrechner</h2>
                    <p className="text-blue-200 text-sm">Erhalten Sie in 2 Minuten Ihre persönliche Kostenschätzung</p>
                </div>

                <div className="p-6">
                    {!istFormularSchritt && (
                        <ProgressBar step={step + 1} total={SCHRITTE.length + 1} />
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {istFormularSchritt ? (
                        <FormularSchritt
                            form={form} setForm={setForm} preis={preis}
                            onSubmit={handleSubmit} loading={loading} submitted={submitted}
                        />
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Schritt {step + 1} von {SCHRITTE.length}</span>
                                <span className="text-xs font-medium text-blue-600">{aktuellerSchritt.label}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">{aktuellerSchritt.frage}</h3>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {aktuellerSchritt.optionen.map(opt => (
                                    <OptionCard
                                        key={opt}
                                        label={aktuellerSchritt.labels ? aktuellerSchritt.labels[opt] : opt}
                                        icon={aktuellerSchritt.icons[opt]}
                                        selected={aktuellerSchritt.mehrfach
                                            ? (form.extras || []).includes(opt)
                                            : form[aktuellerSchritt.id] === opt}
                                        onClick={() => waehlen(opt)}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {step > 0 && (
                                    <button onClick={() => setStep(s => s - 1)}
                                        className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        ← Zurück
                                    </button>
                                )}
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={!aktuellerSchritt.mehrfach && !form[aktuellerSchritt.id]}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40">
                                    {aktuellerSchritt.mehrfach
                                        ? `Weiter${(form.extras||[]).length > 0 ? ` (${(form.extras||[]).length} gewählt)` : ''}`
                                        : 'Weiter →'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-3 text-center">
                    <p className="text-xs text-gray-400">🔒 Ihre Daten sind sicher. Keine Weitergabe an Dritte ohne Ihre Zustimmung.</p>
                </div>
            </div>
        </div>
    );
};

const container = document.getElementById('pool-planer-root');
if (container) {
    ReactDOM.createRoot(container).render(<PoolPlaner />);
}
</script>
<?php
}
