// Black Friday 2026 promo (icf-platform#5141). Rendered only by this script, so with
// JS off nothing shows. The window matches the app's checkout exactly:
// 2026-11-25 00:00 through 2026-11-30 23:59:59 America/Chicago, which is CST
// (-06:00) for the whole window, so the viewer's own time zone never moves it.
(function () {
    var CTA_URL = 'https://app.incentifind.com/register';
    var STARTS = Date.parse('2026-11-25T00:00:00-06:00');
    var ENDS_BEFORE = Date.parse('2026-12-01T00:00:00-06:00');
    var MAX_TIMER_MS = 24 * 60 * 60 * 1000;

    var COPY = {
        teaser: {
            banner: '<strong>Black Friday:</strong> your first report free, Nov 25–30',
            bannerCta: 'Run a free search',
            badge: 'Black Friday · Nov 25–30',
            title: 'Your first report free, Nov 25–30.',
            body: 'From Nov 25 through Nov 30, your first IncentiFind Property Report is free, residential or commercial. Start with a free search today to preview the incentives available to your property.',
            cta: 'Run a Free Search'
        },
        live: {
            banner: '<strong>Black Friday:</strong> your first report free. No credit card needed. Ends Nov 30.',
            bannerCta: 'Get your free report',
            badge: 'Black Friday · Ends Nov 30',
            title: 'Your first report, free.',
            body: 'Get your first IncentiFind Property Report free, residential or commercial. Signed up before but never bought a report? Your first one is free too.',
            cta: 'Get Your Free Report'
        }
    };

    var FACTS = [
        'No credit card needed',
        'Nothing is charged unless you add a card',
        'One free report per buyer',
        'Nov 25 through Nov 30, 11:59 PM Central'
    ];

    var FINE_PRINT = 'Your report is free for its first year. It renews at $25/yr (residential) or $500/yr (commercial) only if you add a card; otherwise it cancels itself. Up to 500 free reports in total; after that, checkout is the regular price. Not available if your account already has a saved card or other payment method, or has ever had an IncentiFind subscription, cancelled ones included: those accounts get the regular paid checkout.';

    function phaseAt(ms) {
        if (ms < STARTS) return 'teaser';
        if (ms < ENDS_BEFORE) return 'live';
        return 'after';
    }

    // Preview override for screenshots and QA, never honored on the production host:
    // ?bf=teaser|live|after, or ?bf=<ISO instant> to force the clock.
    function previewPhase() {
        var host = location.hostname;
        if (host !== 'localhost' && host !== '127.0.0.1') return null;
        var value = new URLSearchParams(location.search).get('bf');
        if (!value) return null;
        if (COPY[value] || value === 'after') return value;
        var forced = Date.parse(value);
        return isNaN(forced) ? null : phaseAt(forced);
    }

    var preview = previewPhase();
    var shown = null;
    var timer = null;

    // Later renders reuse the hrefs already on the page, so a partner aff_id that
    // another script added to the first render survives a phase change.
    function render(phase) {
        if (phase === shown) return;
        shown = phase;
        var oldBanner = document.querySelector('.bf-banner');
        var bannerHref = oldBanner ? oldBanner.href : CTA_URL;
        if (oldBanner) oldBanner.remove();
        var slot = document.getElementById('bf-promo');
        var oldCta = slot && slot.querySelector('a');
        var sectionHref = oldCta ? oldCta.href : CTA_URL;
        if (slot) slot.innerHTML = '';

        var copy = COPY[phase];
        if (!copy) return;

        var banner = document.createElement('a');
        banner.className = 'bf-banner';
        banner.href = bannerHref;
        banner.innerHTML = '<span class="bf-banner-text">' + copy.banner + '</span>' +
            '<span class="bf-banner-cta">' + copy.bannerCta + '</span>';
        document.body.insertBefore(banner, document.body.firstChild);

        if (!slot) return;
        var facts = phase === 'live'
            ? '<ul class="bf-promo-facts">' + FACTS.map(function (f) {
                return '<li><span class="check-icon">✓</span>' + f + '</li>';
            }).join('') + '</ul>'
            : '';
        slot.innerHTML =
            '<section class="bf-promo" aria-labelledby="bf-promo-title">' +
                '<div class="bf-promo-card bf-promo-' + phase + '">' +
                    '<div class="bf-promo-copy">' +
                        '<span class="ytd-badge">' + copy.badge + '</span>' +
                        '<h2 id="bf-promo-title">' + copy.title + '</h2>' +
                        '<p>' + copy.body + '</p>' +
                        '<a class="btn-yellow" href="' + sectionHref + '">' + copy.cta + '</a>' +
                    '</div>' +
                    facts +
                    (phase === 'live' ? '<p class="bf-promo-fine">' + FINE_PRINT + '</p>' : '') +
                '</div>' +
            '</section>';
    }

    // A page left open, or restored from the back-forward cache, re-checks the clock
    // at the next boundary and whenever it comes back into view.
    function update() {
        clearTimeout(timer);
        var now = Date.now();
        render(phaseAt(now));
        var next = now < STARTS ? STARTS : now < ENDS_BEFORE ? ENDS_BEFORE : null;
        if (next !== null) timer = setTimeout(update, Math.min(next - now, MAX_TIMER_MS));
    }

    if (preview) {
        render(preview);
        return;
    }
    update();
    window.addEventListener('pageshow', function (e) { if (e.persisted) update(); });
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') update();
    });
})();
