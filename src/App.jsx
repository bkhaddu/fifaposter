import { useEffect, useMemo, useRef, useState } from "react";

const SAMPLE_MATCHES = [
  {
    id: "sample-mex-rsa",
    competition: "FIFA World Cup",
    stage: "Group A",
    date: "2026-06-13T18:00:00Z",
    status: "FINISHED",
    home: { name: "Mexico", code: "MX", score: 2, scorers: "Quiñones 9'\nJiménez 67'" },
    away: { name: "South Africa", code: "ZA", score: 0, scorers: "No goals" },
  },
  {
    id: "sample-arg-jpn",
    competition: "FIFA World Cup",
    stage: "Group C",
    date: "2026-06-12T21:00:00Z",
    status: "FINISHED",
    home: { name: "Argentina", code: "AR", score: 3, scorers: "Álvarez 18'\nMac Allister 51'\nGarnacho 82'" },
    away: { name: "Japan", code: "JP", score: 1, scorers: "Kubo 63'" },
  },
  {
    id: "sample-usa-ger",
    competition: "FIFA World Cup",
    stage: "Group E",
    date: "2026-06-12T15:00:00Z",
    status: "FINISHED",
    home: { name: "United States", code: "US", score: 1, scorers: "Pulisic 42'" },
    away: { name: "Germany", code: "DE", score: 1, scorers: "Musiala 74'" },
  },
  {
    id: "sample-bra-mar",
    competition: "FIFA World Cup",
    stage: "Group F",
    date: "2026-06-14T19:00:00Z",
    status: "SCHEDULED",
    home: { name: "Brazil", code: "BR", score: 0, scorers: "" },
    away: { name: "Morocco", code: "MA", score: 0, scorers: "" },
  },
];

const FLAGS = {
  DZ: "dz", AR: "ar", AU: "au", AT: "at", BE: "be", BA: "ba", BR: "br",
  CA: "ca", CV: "cv", CO: "co", HR: "hr", CW: "cw", CZ: "cz", CD: "cd",
  EC: "ec", EG: "eg", GB: "gb-eng", FR: "fr", DE: "de", GH: "gh", HT: "ht",
  IR: "ir", IQ: "iq", CI: "ci", JP: "jp", JO: "jo", KR: "kr", MX: "mx",
  MA: "ma", NL: "nl", NZ: "nz", NO: "no", PA: "pa", PY: "py", PT: "pt",
  QA: "qa", SA: "sa", GB_SCT: "gb-sct", SN: "sn", ZA: "za", ES: "es",
  SE: "se", CH: "ch", TN: "tn", TR: "tr", US: "us", UY: "uy", UZ: "uz",
};

const TEAM_CODES = {
  Algeria: "DZ", Argentina: "AR", Australia: "AU", Austria: "AT", Belgium: "BE",
  "Bosnia and Herzegovina": "BA", "Bosnia-Herzegovina": "BA", Brazil: "BR",
  Canada: "CA", "Cape Verde": "CV", Colombia: "CO", Croatia: "HR", Curaçao: "CW",
  "Czech Republic": "CZ", "DR Congo": "CD", "Democratic Republic of the Congo": "CD", Ecuador: "EC", Egypt: "EG",
  England: "GB", France: "FR", Germany: "DE", Ghana: "GH", Haiti: "HT",
  Iran: "IR", Iraq: "IQ", "Ivory Coast": "CI", Japan: "JP", Jordan: "JO",
  "South Korea": "KR", Mexico: "MX", Morocco: "MA", Netherlands: "NL",
  "New Zealand": "NZ", Norway: "NO", Panama: "PA", Paraguay: "PY",
  Portugal: "PT", Qatar: "QA", "Saudi Arabia": "SA", Scotland: "GB_SCT",
  Senegal: "SN", "South Africa": "ZA", Spain: "ES", Sweden: "SE",
  Switzerland: "CH", Tunisia: "TN", Turkey: "TR", USA: "US",
  "United States": "US", Uruguay: "UY", Uzbekistan: "UZ",
};

const BUILT_IN_API = "https://worldcup26.ir/get/games";
const FALLBACK_API = "https://www.thesportsdb.com/api/v1/json/123/eventsseason.php?id=4429&s=2026";
const POSTER_WIDTH = 1122;
const POSTER_HEIGHT = 1402;
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const emptyDraft = {
  competition: "FIFA World Cup",
  stage: "Group stage",
  date: new Date().toISOString(),
  status: "FINISHED",
  home: { name: "Home team", code: "US", score: 0, scorers: "No goals" },
  away: { name: "Away team", code: "MX", score: 0, scorers: "No goals" },
};

function Flag({ code, size = 40 }) {
  const country = FLAGS[code?.toUpperCase()] || code?.toLowerCase();
  return (
    <span className="flag" style={{ width: size, height: size }}>
      {country ? <img src={`https://flagcdn.com/w160/${country}.png`} alt="" /> : "⚽"}
    </span>
  );
}

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    cloud: <path d="M17.5 19H7a5 5 0 1 1 1.7-9.7A7 7 0 0 1 22 12.5 4.5 4.5 0 0 1 17.5 19Z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.37.36.7.6 1 .29.32.68.5 1.1.5h.1v4h-.1c-.42 0-.81.18-1.1.5-.24.3-.45.63-.6 1Z"/></>,
    refresh: <><path d="M20 11a8 8 0 1 0-2.34 5.66"/><path d="M20 4v7h-7"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    drive: <><path d="M8.5 3h7L21 12l-3.5 6H6.5L3 12Z"/><path d="m8.5 3 5.3 9H21M6.5 18l5.3-9"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Poster({ match, posterRef }) {
  const homeFlag = FLAGS[match.home.code?.toUpperCase()] || match.home.code?.toLowerCase();
  const awayFlag = FLAGS[match.away.code?.toUpperCase()] || match.away.code?.toLowerCase();
  const keepOriginalHomeFlag = homeFlag === "us";
  const keepOriginalAwayFlag = awayFlag === "py";
  const keepOriginalScore = Number(match.home.score) === 4 && Number(match.away.score) === 1;
  const winnerName = Number(match.home.score) === Number(match.away.score)
    ? "DRAW"
    : `${Number(match.home.score) > Number(match.away.score) ? match.home.name : match.away.name} WINS`.toUpperCase();
  const scorerLines = (value) => {
    if (!value || /^(no goals|scorers not supplied)$/i.test(value.trim())) return ["No goals"];
    return value.split("\n").filter(Boolean).slice(0, 4);
  };
  const teamNameSize = (name) => name.length > 22 ? 31 : name.length > 14 ? 37 : 45;
  const winnerSize = winnerName.length > 22 ? 30 : winnerName.length > 15 ? 36 : 43;

  return (
    <svg
      ref={posterRef}
      className="poster-svg"
      viewBox={`0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${match.home.name} vs ${match.away.name} result poster`}
    >
      <defs>
        <linearGradient id="scoreBlue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#04418b"/>
          <stop offset=".55" stopColor="#023f8e"/>
          <stop offset="1" stopColor="#003f8b"/>
        </linearGradient>
        <clipPath id="exactHomeFlag">
          <rect x="48" y="746" width="217" height="175" rx="14"/>
        </clipPath>
        <clipPath id="exactAwayFlag">
          <rect x="579" y="746" width="204" height="175" rx="14"/>
        </clipPath>
        <clipPath id="scoreArea">
          <rect x="285" y="758" width="285" height="135"/>
        </clipPath>
        <clipPath id="winnerTextArea">
          <rect x="185" y="547" width="290" height="62"/>
        </clipPath>
        <clipPath id="homeNameArea">
          <rect x="55" y="928" width="235" height="68"/>
        </clipPath>
        <clipPath id="awayNameArea">
          <rect x="566" y="928" width="250" height="68"/>
        </clipPath>
        <clipPath id="homeScorersArea">
          <rect x="55" y="1000" width="330" height="145"/>
        </clipPath>
        <clipPath id="awayScorersArea">
          <path d="M565 1000H840L742 1145H565Z"/>
        </clipPath>
      </defs>
      <image
        data-asset="exact-template"
        href={assetUrl("result-final-template.png")}
        width={POSTER_WIDTH}
        height={POSTER_HEIGHT}
        preserveAspectRatio="none"
      />
      {!keepOriginalHomeFlag && homeFlag && (
        <>
          <rect x="44" y="742" width="225" height="183" rx="16" fill="url(#scoreBlue)"/>
          <image
            data-flag={homeFlag}
            href={assetUrl(`flags/${homeFlag}.png`)}
            x="48"
            y="746"
            width="217"
            height="175"
            preserveAspectRatio="none"
          />
          {homeFlag === "qa" && <rect x="190" y="746" width="75" height="175" fill="#8a1538"/>}
          <rect x="48" y="746" width="217" height="175" rx="2" fill="none" stroke="#fff" strokeWidth="3"/>
        </>
      )}
      {!keepOriginalAwayFlag && awayFlag && (
        <>
          <rect x="575" y="742" width="212" height="183" rx="16" fill="url(#scoreBlue)"/>
          <image
            data-flag={awayFlag}
            href={assetUrl(`flags/${awayFlag}.png`)}
            x="579"
            y="746"
            width="204"
            height="175"
            preserveAspectRatio="none"
          />
          {awayFlag === "qa" && <rect x="713" y="746" width="70" height="175" fill="#8a1538"/>}
          <rect x="579" y="746" width="204" height="175" rx="2" fill="none" stroke="#fff" strokeWidth="3"/>
        </>
      )}
      {!keepOriginalScore && (
        <>
          <rect x="285" y="758" width="285" height="135" fill="url(#scoreBlue)" clipPath="url(#scoreArea)"/>
          <text
            x="427"
            y="879"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="106"
            fontWeight="400"
            fill="#fff"
            textRendering="geometricPrecision"
          >
            {match.home.score} - {match.away.score}
          </text>
        </>
      )}
      <g clipPath="url(#winnerTextArea)">
        <image href={assetUrl("result-final-template.png")} y="-100" width={POSTER_WIDTH} height={POSTER_HEIGHT}/>
      </g>
      <g clipPath="url(#homeNameArea)">
        <image href={assetUrl("result-final-template.png")} y="-225" width={POSTER_WIDTH} height={POSTER_HEIGHT}/>
      </g>
      <g clipPath="url(#awayNameArea)">
        <image href={assetUrl("result-final-template.png")} x="310" y="-225" width={POSTER_WIDTH} height={POSTER_HEIGHT}/>
      </g>
      <g clipPath="url(#homeScorersArea)">
        <image href={assetUrl("result-final-template.png")} y="-205" width={POSTER_WIDTH} height={POSTER_HEIGHT}/>
      </g>
      <g clipPath="url(#awayScorersArea)">
        <image href={assetUrl("result-final-template.png")} x="310" y="-205" width={POSTER_WIDTH} height={POSTER_HEIGHT}/>
      </g>

      <text x="330" y="594" textAnchor="middle" fontFamily="'DM Sans', Arial, sans-serif" fontSize={winnerSize} fontWeight="700" fill="#fff" textRendering="geometricPrecision">
        {winnerName}
      </text>
      <text x="171" y="976" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={teamNameSize(match.home.name)} fontWeight="700" fill="#fff" textRendering="geometricPrecision">
        {match.home.name}
      </text>
      <text x="691" y="976" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize={teamNameSize(match.away.name)} fontWeight="700" fill="#fff" textRendering="geometricPrecision">
        {match.away.name}
      </text>
      <text x="67" y="1032" fontFamily="'DM Sans', Arial, sans-serif" fontSize="25" fontWeight="600" fill="#fff" textRendering="geometricPrecision">
        {scorerLines(match.home.scorers).map((line, index) => (
          <tspan x="67" dy={index ? 39 : 0} key={`${line}-${index}`}>{line}</tspan>
        ))}
      </text>
      <text x="577" y="1032" fontFamily="'DM Sans', Arial, sans-serif" fontSize="25" fontWeight="600" fill="#fff" textRendering="geometricPrecision">
        {scorerLines(match.away.scorers).map((line, index) => (
          <tspan x="577" dy={index ? 39 : 0} key={`${line}-${index}`}>{line}</tspan>
        ))}
      </text>
    </svg>
  );

  const spanishNames = {
    "United States": "Estados Unidos", USA: "Estados Unidos", Germany: "Alemania",
    "South Korea": "Corea del Sur", "Czech Republic": "República Checa",
    "South Africa": "Sudáfrica", Mexico: "México", Canada: "Canadá",
    Morocco: "Marruecos", Japan: "Japón", Brazil: "Brasil",
    Switzerland: "Suiza", Sweden: "Suecia", Turkey: "Turquía", England: "Inglaterra",
    Scotland: "Escocia", Netherlands: "Países Bajos", "Ivory Coast": "Costa de Marfil",
    "Bosnia and Herzegovina": "Bosnia y Herzegovina", "Cape Verde": "Cabo Verde",
    "Saudi Arabia": "Arabia Saudita", "New Zealand": "Nueva Zelanda", Algeria: "Argelia",
    "Democratic Republic of the Congo": "R. D. del Congo",
  };
  const homeName = spanishNames[match.home.name] || match.home.name;
  const awayName = spanishNames[match.away.name] || match.away.name;
  const teamFontSize = (name) => name.length > 20 ? 36 : name.length > 12 ? 42 : 50;
  const teamNameLines = (name) => {
    if (name.length <= 11) return [name];
    const words = name.split(" ");
    let bestIndex = 1;
    let bestDifference = Infinity;
    for (let index = 1; index < words.length; index += 1) {
      const left = words.slice(0, index).join(" ");
      const right = words.slice(index).join(" ");
      const difference = Math.abs(left.length - right.length);
      if (difference < bestDifference) {
        bestDifference = difference;
        bestIndex = index;
      }
    }
    return [words.slice(0, bestIndex).join(" "), words.slice(bestIndex).join(" ")];
  };
  const homeNameLines = teamNameLines(homeName);
  const awayNameLines = teamNameLines(awayName);
  const winnerText = match.home.score === match.away.score
    ? "EMPATE"
    : `${match.home.score > match.away.score ? homeName : awayName} GANA`.toUpperCase();
  const translateScorers = (value) => {
    if (!value || /^(no goals|scorers not supplied)$/i.test(value)) return "Sin goles";
    return value;
  };
  const stageSpanish = match.stage
    .replace(/^Group /i, "Grupo ")
    .replace(/^Round /i, "Ronda ")
    .replace(/^Tournament match$/i, "Partido del torneo");
  const date = new Date(match.date);
  const displayDate = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }).replace(".", "").toUpperCase();

  return (
    <svg ref={posterRef} className="poster-svg" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="night" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#05111f"/>
          <stop offset=".55" stopColor="#02060b"/>
          <stop offset="1" stopColor="#0c1720"/>
        </linearGradient>
        <linearGradient id="blue" x1=".1" y1="0" x2=".85" y2="1">
          <stop stopColor="#0876c7"/>
          <stop offset=".55" stopColor="#075ca5"/>
          <stop offset="1" stopColor="#03417c"/>
        </linearGradient>
        <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fff"/>
          <stop offset=".45" stopColor="#f9fbff"/>
          <stop offset="1" stopColor="#a9bdd2"/>
        </linearGradient>
        <radialGradient id="glow">
          <stop stopColor="#fbcf57" stopOpacity=".8"/>
          <stop offset="1" stopColor="#fbcf57" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="blueGlow" cx=".25" cy=".42" r=".8">
          <stop offset="0" stopColor="#1592dd" stopOpacity=".2"/>
          <stop offset=".58" stopColor="#0870bd" stopOpacity=".04"/>
          <stop offset="1" stopColor="#022e69" stopOpacity=".3"/>
        </radialGradient>
        <filter id="blueTexture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".006 .014" numOctaves="4" seed="31" result="noise"/>
          <feColorMatrix
            in="noise"
            type="matrix"
            result="tintedNoise"
            values="0 0 0 0 0.05
                    0 0 0 0 0.42
                    0 0 0 0 0.78
                    0 0 0 .24 0"
          />
          <feComposite in="tintedNoise" in2="SourceAlpha" operator="in"/>
        </filter>
        <clipPath id="trophyClip"><rect x="545" width="535" height="1350"/></clipPath>
        <linearGradient id="trophyFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0"/>
          <stop offset=".13" stopColor="#fff" stopOpacity=".82"/>
          <stop offset=".25" stopColor="#fff"/>
          <stop offset="1" stopColor="#fff"/>
        </linearGradient>
        <mask id="trophyMask"><rect x="475" width="605" height="1350" fill="url(#trophyFade)"/></mask>
        <clipPath id="homeFlag"><rect x="46" y="716" width="210" height="164" rx="13"/></clipPath>
        <clipPath id="awayFlag"><rect x="560" y="716" width="210" height="164" rx="13"/></clipPath>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="16" floodOpacity=".32"/></filter>
      </defs>

      <rect width="1080" height="1350" fill="url(#night)"/>
      <circle cx="830" cy="480" r="450" fill="url(#glow)" opacity=".13"/>
      <g>
        <image data-asset="reference" href={assetUrl("trophy-crop.png")} x="585" y="72" width="530" height="1210" preserveAspectRatio="xMidYMid meet" opacity=".99"/>
      </g>

      <path
        d="M0 0H355
           L525 270
           L438 375
           L610 505
           L476 635
           L875 955
           L558 1350
           H0Z"
        fill="url(#blue)"
      />
      <path
        d="M0 0H355
           L525 270
           L438 375
           L610 505
           L476 635
           L875 955
           L558 1350
           H0Z"
        fill="url(#blueGlow)"
      />
      <path
        d="M0 0H355
           L525 270
           L438 375
           L610 505
           L476 635
           L875 955
           L558 1350
           H0Z"
        fill="#167ecb"
        filter="url(#blueTexture)"
        opacity=".34"
      />
      <g filter="url(#shadow)" fontFamily="'Barlow Condensed', Arial, sans-serif" fontWeight="900" fill="url(#silver)">
        <text x="238" y="242" textAnchor="middle" fontSize="204" letterSpacing="4">FIN</text>
        <text x="52" y="500" fontSize="214" letterSpacing="-4">PARTIDO</text>
      </g>
      <g transform="translate(250 205) rotate(-10)">
        <rect width="198" height="126" rx="2" fill="#f2d500"/>
        <text x="99" y="94" textAnchor="middle" fontFamily="'Barlow Condensed', Arial" fontSize="92" fontWeight="900" fill="#fff">DEL</text>
      </g>

      <text x="292" y="590" textAnchor="middle" fontFamily="'DM Sans', Arial" fontSize={winnerText.length > 18 ? 40 : 48} fontWeight="500" fill="#fff" textLength={winnerText.length > 18 ? 410 : undefined} lengthAdjust="spacingAndGlyphs">{winnerText}</text>

      <rect x="42" y="712" width="218" height="172" rx="16" fill="#fff" filter="url(#shadow)"/>
      {homeFlag && <image data-flag={homeFlag} href={`https://flagcdn.com/w640/${homeFlag}.png`} x="46" y="716" width="210" height="164" preserveAspectRatio="xMidYMid slice" clipPath="url(#homeFlag)"/>}
      <rect x="46" y="716" width="210" height="164" rx="13" fill="none" stroke="#fff" strokeWidth="5"/>

      <rect x="556" y="712" width="218" height="172" rx="16" fill="#fff" filter="url(#shadow)"/>
      {awayFlag && <image data-flag={awayFlag} href={`https://flagcdn.com/w640/${awayFlag}.png`} x="560" y="716" width="210" height="164" preserveAspectRatio="xMidYMid slice" clipPath="url(#awayFlag)"/>}
      <rect x="560" y="716" width="210" height="164" rx="13" fill="none" stroke="#fff" strokeWidth="5"/>

      <text x="408" y="847" textAnchor="middle" fontFamily="Georgia, serif" fontSize="104" fontWeight="500" fill="#fff">{match.home.score} - {match.away.score}</text>
      <text x="151" y={homeNameLines.length > 1 ? 918 : 936} textAnchor="middle" fontFamily="Georgia, serif" fontSize={homeNameLines.length > 1 ? 37 : 49} fontWeight="700" fill="#fff">
        {homeNameLines.map((line, index) => <tspan x="151" dy={index ? 40 : 0} key={line}>{line}</tspan>)}
      </text>
      <text x="665" y={awayNameLines.length > 1 ? 918 : 936} textAnchor="middle" fontFamily="Georgia, serif" fontSize={awayNameLines.length > 1 ? 37 : 49} fontWeight="700" fill="#fff">
        {awayNameLines.map((line, index) => <tspan x="665" dy={index ? 40 : 0} key={line}>{line}</tspan>)}
      </text>
      <line x1="408" y1="965" x2="408" y2="1145" stroke="#f2d500" strokeWidth="3"/>
      <text x="65" y="1015" fontFamily="'DM Sans', Arial" fontSize="27" fontWeight="500" fill="#fff">
        {translateScorers(match.home.scorers).split("\n").slice(0, 4).map((line, index) => <tspan x="65" dy={index ? 41 : 0} key={line + index}>{line}</tspan>)}
      </text>
      <text x="552" y="1015" fontFamily="'DM Sans', Arial" fontSize="27" fontWeight="500" fill="#fff">
        {translateScorers(match.away.scorers).split("\n").slice(0, 4).map((line, index) => <tspan x="552" dy={index ? 41 : 0} key={line + index}>{line}</tspan>)}
      </text>

      <image data-asset="brand-logo" href={assetUrl("pase-y-gol.png")} x="936" y="1262" width="136" height="82" preserveAspectRatio="xMidYMid meet"/>
    </svg>
  );
}

function normalizeMatch(raw, index) {
  const homeTeam = raw.homeTeam || raw.home || {};
  const awayTeam = raw.awayTeam || raw.away || {};
  const score = raw.score?.fullTime || raw.score || {};
  return {
    id: String(raw.id ?? raw.fixture?.id ?? `api-${index}-${raw.utcDate || raw.date || Date.now()}`),
    competition: raw.competition?.name || raw.league?.name || raw.competition || "FIFA Match",
    stage: raw.stage || raw.group || raw.round || "Tournament match",
    date: raw.utcDate || raw.fixture?.date || raw.date || new Date().toISOString(),
    status: raw.status || raw.fixture?.status?.short || "FINISHED",
    home: {
      name: homeTeam.name || raw.teams?.home?.name || "Home team",
      code: homeTeam.tla || homeTeam.code || raw.teams?.home?.code || "",
      score: Number(score.home ?? raw.goals?.home ?? 0),
      scorers: raw.homeScorers || "Scorers not supplied",
    },
    away: {
      name: awayTeam.name || raw.teams?.away?.name || "Away team",
      code: awayTeam.tla || awayTeam.code || raw.teams?.away?.code || "",
      score: Number(score.away ?? raw.goals?.away ?? 0),
      scorers: raw.awayScorers || "Scorers not supplied",
    },
  };
}

function cleanScorers(value) {
  if (!value || value === "null") return "No goals";
  return String(value)
    .replace(/[{}“”"]/g, "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .join("\n") || "No goals";
}

function normalizeWorldCupMatch(raw) {
  const homeName = raw.home_team_name_en || raw.home_team_label || "TBD";
  const awayName = raw.away_team_name_en || raw.away_team_label || "TBD";
  const finished = String(raw.finished).toUpperCase() === "TRUE";
  const [datePart, timePart = "12:00"] = String(raw.local_date || "").split(" ");
  const [month, day, year] = datePart.split("/");
  return {
    id: `wc26-${raw.id}`,
    competition: "FIFA World Cup",
    stage: raw.group ? (raw.group.length === 1 ? `Group ${raw.group}` : raw.group) : raw.type || "Tournament match",
    date: year ? `${year}-${month}-${day}T${timePart}:00` : new Date().toISOString(),
    status: finished ? "FINISHED" : raw.time_elapsed === "notstarted" ? "SCHEDULED" : "LIVE",
    home: {
      name: homeName,
      code: TEAM_CODES[homeName] || "",
      score: Number(raw.home_score || 0),
      scorers: cleanScorers(raw.home_scorers),
    },
    away: {
      name: awayName,
      code: TEAM_CODES[awayName] || "",
      score: Number(raw.away_score || 0),
      scorers: cleanScorers(raw.away_scorers),
    },
  };
}

function normalizeSportsDbMatch(raw) {
  const homeName = raw.strHomeTeam || "Home team";
  const awayName = raw.strAwayTeam || "Away team";
  return {
    id: `sportsdb-${raw.idEvent}`,
    competition: raw.strLeague || "FIFA World Cup",
    stage: raw.strGroup || (raw.intRound ? `Round ${raw.intRound}` : "Tournament match"),
    date: `${raw.dateEvent}T${raw.strTime || "12:00:00"}`,
    status: raw.strStatus || (raw.intHomeScore !== null ? "FINISHED" : "SCHEDULED"),
    home: {
      name: homeName,
      code: TEAM_CODES[homeName] || "",
      score: Number(raw.intHomeScore || 0),
      scorers: "Scorers not supplied",
    },
    away: {
      name: awayName,
      code: TEAM_CODES[awayName] || "",
      score: Number(raw.intAwayScore || 0),
      scorers: "Scorers not supplied",
    },
  };
}

function isFinished(status) {
  return ["FINISHED", "FT", "AET", "PEN", "FULL_TIME"].includes(String(status).toUpperCase());
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const POSTER_FONTS = [
  ["Barlow Condensed", 500, assetUrl("fonts/barlow-condensed-500.ttf")],
  ["Barlow Condensed", 600, assetUrl("fonts/barlow-condensed-600.ttf")],
  ["Barlow Condensed", 700, assetUrl("fonts/barlow-condensed-700.ttf")],
  ["Barlow Condensed", 800, assetUrl("fonts/barlow-condensed-800.ttf")],
  ["Barlow Condensed", 900, assetUrl("fonts/barlow-condensed-900.ttf")],
  ["DM Sans", 400, assetUrl("fonts/dm-sans-400.ttf")],
  ["DM Sans", 500, assetUrl("fonts/dm-sans-500.ttf")],
  ["DM Sans", 600, assetUrl("fonts/dm-sans-600.ttf")],
  ["DM Sans", 700, assetUrl("fonts/dm-sans-700.ttf")],
];

let embeddedPosterFontCss;

async function getEmbeddedPosterFontCss() {
  if (!embeddedPosterFontCss) {
    embeddedPosterFontCss = Promise.all(POSTER_FONTS.map(async ([family, weight, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Could not load ${family} ${weight}`);
      const dataUrl = await blobToDataUrl(await response.blob());
      return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url('${dataUrl}') format('truetype');}`;
    })).then((rules) => rules.join(""));
  }
  return embeddedPosterFontCss;
}

async function posterToBlob(svgElement) {
  await document.fonts.ready;
  const clone = svgElement.cloneNode(true);
  const fontStyle = document.createElementNS("http://www.w3.org/2000/svg", "style");
  fontStyle.textContent = await getEmbeddedPosterFontCss();
  clone.querySelector("defs")?.appendChild(fontStyle);
  const images = [...clone.querySelectorAll("image")];
  await Promise.all(images.map(async (image) => {
    const href = image.getAttribute("href");
    if (!href) return;
    try {
      const response = await fetch(href);
      const dataUrl = await blobToDataUrl(await response.blob());
      image.setAttribute("href", dataUrl);
    } catch {
      image.remove();
    }
  }));

  clone.setAttribute("width", String(POSTER_WIDTH));
  clone.setAttribute("height", String(POSTER_HEIGHT));
  const svg = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  canvas.getContext("2d").drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
}

function fileNameFor(match) {
  const slug = `${match.home.name}-${match.home.score}-${match.away.score}-${match.away.name}`
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "final-result"}.png`;
}

export default function App() {
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem("fw-matches");
    return saved ? JSON.parse(saved) : SAMPLE_MATCHES;
  });
  const [selectedId, setSelectedId] = useState(matches[0]?.id);
  const [view, setView] = useState("matches");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [settings, setSettings] = useState(() => ({
    provider: localStorage.getItem("fw-provider") || "built-in",
    apiUrl: localStorage.getItem("fw-api-url") || "",
    apiKey: localStorage.getItem("fw-api-key") || "",
    googleClientId: localStorage.getItem("fw-google-client") || "",
    driveFolderId: localStorage.getItem("fw-drive-folder") || "",
    autoSync: localStorage.getItem("fw-auto-sync") !== "false",
  }));
  const posterRef = useRef(null);
  const tokenClientRef = useRef(null);
  const initialSyncRef = useRef(false);

  const selected = matches.find((match) => match.id === selectedId) || matches[0];
  const filtered = useMemo(() => matches.filter((match) => {
    const text = `${match.home.name} ${match.away.name} ${match.competition}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "all" || (statusFilter === "finished" ? isFinished(match.status) : !isFinished(match.status)));
  }), [matches, query, statusFilter]);

  useEffect(() => {
    localStorage.setItem("fw-matches", JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    if (!matches.some((match) => match.id === selectedId)) {
      setSelectedId(matches.find((match) => isFinished(match.status))?.id || matches[0]?.id);
    }
  }, [matches, selectedId]);

  useEffect(() => {
    if (!settings.autoSync) return undefined;
    if (!initialSyncRef.current) {
      initialSyncRef.current = true;
      syncMatches(true);
    }
    const timer = setInterval(() => syncMatches(true), 60_000);
    return () => clearInterval(timer);
  }, [settings.autoSync, settings.provider, settings.apiUrl, settings.apiKey]);

  useEffect(() => {
    if (!settings.googleClientId) return;
    const load = () => {
      if (!window.google?.accounts?.oauth2) return;
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: settings.googleClientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: () => {},
      });
    };
    if (window.google?.accounts?.oauth2) load();
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = load;
      document.head.appendChild(script);
    }
  }, [settings.googleClientId]);

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  }

  function saveSettings(next) {
    setSettings(next);
    localStorage.setItem("fw-provider", next.provider);
    localStorage.setItem("fw-api-url", next.apiUrl);
    localStorage.setItem("fw-api-key", next.apiKey);
    localStorage.setItem("fw-google-client", next.googleClientId);
    localStorage.setItem("fw-drive-folder", next.driveFolderId);
    localStorage.setItem("fw-auto-sync", String(next.autoSync));
    flash("Settings saved locally");
  }

  async function syncMatches(silent = false) {
    if (settings.provider === "custom" && !settings.apiUrl) {
      flash("Add your match API URL in Settings first");
      setView("settings");
      return;
    }
    setBusy(true);
    try {
      let incoming;
      let source = "World Cup feed";
      if (settings.provider === "custom") {
        const response = await fetch(settings.apiUrl, {
          headers: settings.apiKey ? { "X-Auth-Token": settings.apiKey, Authorization: `Bearer ${settings.apiKey}` } : {},
        });
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const payload = await response.json();
        const rows = Array.isArray(payload) ? payload : payload.matches || payload.response || payload.data || [];
        incoming = rows.map(normalizeMatch);
        source = "custom feed";
      } else {
        try {
          const response = await fetch(BUILT_IN_API);
          if (!response.ok) throw new Error(`Primary feed returned ${response.status}`);
          const payload = await response.json();
          incoming = (payload.games || []).map(normalizeWorldCupMatch);
        } catch {
          const response = await fetch(FALLBACK_API);
          if (!response.ok) throw new Error(`Fallback feed returned ${response.status}`);
          const payload = await response.json();
          incoming = (payload.events || []).map(normalizeSportsDbMatch);
          source = "TheSportsDB fallback";
        }
      }
      setMatches((current) => {
        const retained = settings.provider === "built-in"
          ? current.filter((match) => !match.id.startsWith("sample-") && !match.id.startsWith("sportsdb-") && !match.id.startsWith("wc26-"))
          : current;
        const merged = new Map(retained.map((match) => [match.id, match]));
        incoming.forEach((match) => merged.set(match.id, { ...merged.get(match.id), ...match }));
        return [...merged.values()].sort((a, b) => {
          const aFinished = isFinished(a.status);
          const bFinished = isFinished(b.status);
          if (aFinished !== bFinished) return aFinished ? -1 : 1;
          return aFinished
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        });
      });
      if (!silent) flash(`Synced ${incoming.length} matches from ${source}`);
    } catch (error) {
      flash(`Sync failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function downloadPoster() {
    if (!selected || !posterRef.current) return;
    setBusy(true);
    try {
      const blob = await posterToBlob(posterRef.current);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileNameFor(selected);
      link.click();
      URL.revokeObjectURL(link.href);
      flash("Poster downloaded");
    } catch (error) {
      flash(`Export failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function uploadToDrive() {
    if (!settings.googleClientId) {
      setView("settings");
      flash("Add a Google OAuth Client ID first");
      return;
    }
    if (!tokenClientRef.current || !selected) {
      flash("Google sign-in is still loading");
      return;
    }
    setBusy(true);
    try {
      const accessToken = await new Promise((resolve, reject) => {
        tokenClientRef.current.callback = (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response.access_token);
        };
        tokenClientRef.current.requestAccessToken({ prompt: "" });
      });
      const png = await posterToBlob(posterRef.current);
      const metadata = {
        name: fileNameFor(selected),
        mimeType: "image/png",
        ...(settings.driveFolderId ? { parents: [settings.driveFolderId] } : {}),
      };
      const boundary = `final_whistle_${Date.now()}`;
      const body = new Blob([
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
        `--${boundary}\r\nContent-Type: image/png\r\n\r\n`,
        png,
        `\r\n--${boundary}--`,
      ]);
      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      });
      if (!response.ok) throw new Error(`Drive returned ${response.status}`);
      flash("Poster added to Google Drive");
    } catch (error) {
      flash(`Drive upload failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  function addMatch(event) {
    event.preventDefault();
    const match = { ...draft, id: `manual-${Date.now()}`, home: { ...draft.home }, away: { ...draft.away } };
    setMatches((current) => [match, ...current]);
    setSelectedId(match.id);
    setShowEditor(false);
    setDraft(emptyDraft);
    flash("Match added and poster generated");
  }

  const finishedCount = matches.filter((match) => isFinished(match.status)).length;
  const upcomingCount = matches.length - finishedCount;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">FW</span>
          <span><strong>FINAL WHISTLE</strong><small>POSTER STUDIO</small></span>
        </div>
        <nav>
          <button className={view === "matches" ? "active" : ""} onClick={() => setView("matches")}><Icon name="grid"/>Matches</button>
          <button className={view === "posters" ? "active" : ""} onClick={() => setView("posters")}><Icon name="image"/>Poster studio</button>
          <button onClick={uploadToDrive}><Icon name="cloud"/>Google Drive</button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}><Icon name="settings"/>Settings</button>
        </nav>
        <div className="sidebar-card">
          <span className="live-dot"/>
          <div><strong>Live feed ready</strong><small>{settings.autoSync ? "Checking every minute" : "Enable auto-sync in settings"}</small></div>
        </div>
        <p className="version">FINAL WHISTLE · V1.0</p>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">TOURNAMENT CONTROL</p>
            <h1>{view === "settings" ? "Connections" : view === "posters" ? "Poster studio" : "Match center"}</h1>
          </div>
          <div className="header-actions">
            <button className="button secondary" onClick={() => syncMatches()} disabled={busy}><Icon name="refresh"/>{busy ? "Working…" : "Sync matches"}</button>
            <button className="button primary" onClick={() => setShowEditor(true)}><Icon name="plus"/>Add result</button>
          </div>
        </header>

        {view === "settings" ? (
          <Settings settings={settings} onSave={saveSettings} />
        ) : (
          <>
            <section className="stats-row">
              <div className="stat-card"><span>Matches tracked</span><strong>{matches.length}</strong><small>{settings.provider === "built-in" ? "FIFA World Cup 2026 feed" : "Across your connected feed"}</small></div>
              <div className="stat-card"><span>Final results</span><strong>{finishedCount}</strong><small><i className="success-dot"/>Ready for publishing</small></div>
              <div className="stat-card"><span>Upcoming</span><strong>{upcomingCount}</strong><small>Waiting for full time</small></div>
              <div className="stat-card accent"><span>Drive connection</span><strong>{settings.googleClientId ? "Ready" : "Setup"}</strong><small>{settings.googleClientId ? "OAuth configured" : "Client ID required"}</small></div>
            </section>

            <section className="workspace">
              <div className="match-panel">
                <div className="panel-head">
                  <div><p className="eyebrow">MATCH FEED</p><h2>Results</h2></div>
                  <span className="count-badge">{filtered.length}</span>
                </div>
                <div className="filters">
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team or competition…" />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="all">All matches</option>
                    <option value="finished">Final only</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div className="match-list">
                  {filtered.map((match) => (
                    <button key={match.id} className={`match-row ${selected?.id === match.id ? "selected" : ""}`} onClick={() => setSelectedId(match.id)}>
                      <div className="match-meta"><span>{match.stage}</span><time>{new Date(match.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></div>
                      <div className="team-line"><Flag code={match.home.code}/><strong>{match.home.name}</strong><b>{isFinished(match.status) ? match.home.score : "–"}</b></div>
                      <div className="team-line"><Flag code={match.away.code}/><strong>{match.away.name}</strong><b>{isFinished(match.status) ? match.away.score : "–"}</b></div>
                      <span className={`status ${isFinished(match.status) ? "final" : ""}`}>{isFinished(match.status) ? "FINAL" : match.status}</span>
                    </button>
                  ))}
                  {!filtered.length && <div className="empty">No matches found.</div>}
                </div>
              </div>

              <div className="preview-panel">
                <div className="panel-head">
                  <div><p className="eyebrow">LIVE PREVIEW</p><h2>{selected ? `${selected.home.name} vs ${selected.away.name}` : "Select a match"}</h2></div>
                  <span className="format-pill">4:5 · 1122 × 1402</span>
                </div>
                <div className="poster-stage">
                  {selected && <Poster match={selected} posterRef={posterRef}/>}
                </div>
                <div className="poster-actions">
                  <button className="button secondary wide" onClick={downloadPoster} disabled={busy || !selected}><Icon name="download"/>Download PNG</button>
                  <button className="button drive wide" onClick={uploadToDrive} disabled={busy || !selected}><Icon name="drive"/>Add to Google Drive</button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {showEditor && <MatchEditor draft={draft} setDraft={setDraft} onClose={() => setShowEditor(false)} onSubmit={addMatch}/>}
      {notice && <div className="toast"><Icon name="check"/>{notice}</div>}
    </div>
  );
}

function Settings({ settings, onSave }) {
  const [form, setForm] = useState(settings);
  return (
    <div className="settings-grid">
      <form className="settings-card" onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
        <p className="eyebrow">MATCH DATA</p>
        <h2>Results API</h2>
        <p className="helper">The built-in provider needs no account or API key. It covers all 104 World Cup 2026 matches, scores, statuses, and goal scorers, with TheSportsDB as an automatic fallback.</p>
        <div className="provider-options">
          <label className={`provider-option ${form.provider === "built-in" ? "selected" : ""}`}>
            <input type="radio" name="provider" value="built-in" checked={form.provider === "built-in"} onChange={(e) => setForm({ ...form, provider: e.target.value })}/>
            <span><strong>Built-in World Cup feed</strong><small>Free · no key · automatic fallback</small></span>
            <b>RECOMMENDED</b>
          </label>
          <label className={`provider-option ${form.provider === "custom" ? "selected" : ""}`}>
            <input type="radio" name="provider" value="custom" checked={form.provider === "custom"} onChange={(e) => setForm({ ...form, provider: e.target.value })}/>
            <span><strong>Custom JSON feed</strong><small>Use your own football data provider</small></span>
          </label>
        </div>
        {form.provider === "custom" && (
          <div className="custom-api-fields">
            <label>API endpoint<input value={form.apiUrl} onChange={(e) => setForm({ ...form, apiUrl: e.target.value })} placeholder="https://api.example.com/matches" /></label>
            <label>API key<input type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="Stored only in this browser" /></label>
          </div>
        )}
        <label className="toggle-row"><span><strong>Automatic sync</strong><small>Check for completed matches every 60 seconds</small></span><input type="checkbox" checked={form.autoSync} onChange={(e) => setForm({ ...form, autoSync: e.target.checked })}/></label>
        <div className="divider"/>
        <p className="eyebrow">GOOGLE DRIVE</p>
        <h2>Drive upload</h2>
        <p className="helper">Create a Web OAuth client in Google Cloud, enable the Drive API, and add this app’s URL as an authorized JavaScript origin.</p>
        <label>OAuth client ID<input value={form.googleClientId} onChange={(e) => setForm({ ...form, googleClientId: e.target.value })} placeholder="000000000000-…apps.googleusercontent.com" /></label>
        <label>Drive folder ID <span>optional</span><input value={form.driveFolderId} onChange={(e) => setForm({ ...form, driveFolderId: e.target.value })} placeholder="Upload to My Drive when blank" /></label>
        <button className="button primary" type="submit">Save connections</button>
      </form>
      <div className="info-card">
        <span className="info-number">01</span><h3>Connect the feed</h3><p>Paste your provider endpoint and API key. Use the manual editor whenever scorer data needs a correction.</p>
        <span className="info-number">02</span><h3>Generate at full time</h3><p>Finished matches appear in the feed and are instantly available in the poster studio.</p>
        <span className="info-number">03</span><h3>Publish</h3><p>Download a production PNG or send it directly into your chosen Google Drive folder.</p>
      </div>
    </div>
  );
}

function MatchEditor({ draft, setDraft, onClose, onSubmit }) {
  const teamField = (side, field, value) => setDraft({ ...draft, [side]: { ...draft[side], [field]: value } });
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={onSubmit}>
        <div className="modal-head"><div><p className="eyebrow">MANUAL RESULT</p><h2>Create a poster</h2></div><button type="button" onClick={onClose}>×</button></div>
        <div className="form-grid">
          <label>Competition<input value={draft.competition} onChange={(e) => setDraft({ ...draft, competition: e.target.value })}/></label>
          <label>Stage<input value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}/></label>
          {["home", "away"].map((side) => (
            <div className="team-form" key={side}>
              <h3>{side} team</h3>
              <label>Team name<input required value={draft[side].name} onChange={(e) => teamField(side, "name", e.target.value)}/></label>
              <div className="split-fields">
                <label>Country code<input maxLength="2" value={draft[side].code} onChange={(e) => teamField(side, "code", e.target.value.toUpperCase())}/></label>
                <label>Score<input min="0" type="number" value={draft[side].score} onChange={(e) => teamField(side, "score", Number(e.target.value))}/></label>
              </div>
              <label>Scorers<textarea value={draft[side].scorers} onChange={(e) => teamField(side, "scorers", e.target.value)} placeholder={"Player 12'\nPlayer 76'"}/></label>
            </div>
          ))}
        </div>
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit">Generate poster</button></div>
      </form>
    </div>
  );
}
