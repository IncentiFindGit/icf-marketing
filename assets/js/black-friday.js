// Black Friday 2026 promo (icf-platform#5141). Rendered only by this script, so with
// JS off nothing shows. The window matches the app's checkout exactly:
// 2026-11-25 00:00 through 2026-11-30 23:59:59 America/Chicago.
(function () {
    var CTA_URL = 'https://app.incentifind.com/register';
    var STARTS = '2026-11-25T00:00';
    var ENDS_BEFORE = '2026-12-01T00:00';

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
        'Nothing is charged automatically',
        'One free report per buyer',
        'Nov 25 through Nov 30, 11:59 PM Central'
    ];

    var FINE_PRINT = 'Your report is free for its first year. It renews at $25/yr (residential) or $500/yr (commercial) only if you add a card; otherwise it cancels itself. Up to 500 free reports in total; after that, checkout is the regular price. Not available on accounts that already hold an IncentiFind Pro or legacy subscription.';

    // Wall-clock time in Chicago as "YYYY-MM-DDTHH:MM", so the window never depends
    // on the viewer's own time zone.
    function chicagoNow(date) {
        var parts = {};
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Chicago',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(date).forEach(function (p) { parts[p.type] = p.value; });
        return parts.year + '-' + parts.month + '-' + parts.day + 'T' + parts.hour + ':' + parts.minute;
    }

    function phaseAt(date) {
        var now = chicagoNow(date);
        if (now < STARTS) return 'teaser';
        if (now < ENDS_BEFORE) return 'live';
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
        var forced = new Date(value);
        return isNaN(forced.getTime()) ? null : phaseAt(forced);
    }

    var phase;
    try {
        phase = previewPhase() || phaseAt(new Date());
    } catch (e) {
        return;
    }
    var copy = COPY[phase];
    if (!copy) return;

    var banner = document.createElement('a');
    banner.className = 'bf-banner';
    banner.href = CTA_URL;
    banner.innerHTML = '<span class="bf-banner-text">' + copy.banner + '</span>' +
        '<span class="bf-banner-cta">' + copy.bannerCta + '</span>';
    document.body.insertBefore(banner, document.body.firstChild);

    var slot = document.getElementById('bf-promo');
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
                    '<a class="btn-yellow" href="' + CTA_URL + '">' + copy.cta + '</a>' +
                '</div>' +
                facts +
                (phase === 'live' ? '<p class="bf-promo-fine">' + FINE_PRINT + '</p>' : '') +
            '</div>' +
        '</section>';
})();
