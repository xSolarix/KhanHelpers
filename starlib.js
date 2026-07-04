/**
 * @fileoverview Starlib - A high-fidelity, lightweight computational astronomy library.
 * This library provides rigorous algorithms to calculate planetary positions, sidereal time,
 * coordinate systems transformations, and observer alt-az coordinates.
 * 
 * Fits JPL Keplerian elements and rates valid for 1800 AD to 2050 AD.
 * 
 * @author xSolarix
 * @version 2.0.0
 */

class Starlib {
    static PLANET_ELEMENTS = {
        "Mercury": {
            a0: 0.38709927, adot: 0.00000037,
            e0: 0.20563593, edot: 0.00001906,
            i0: 7.00497902, idot: -0.00594749,
            L0: 252.25032350, Ldot: 149472.67411175,
            ap0: 77.45779628, apdot: 0.16047689,
            la0: 48.33076593, ladot: -0.12534081,
            H: -0.42, p1: 0.0380, p2: -0.000273, p3: 0.000002
        },
        "Venus": {
            a0: 0.72333566, adot: 0.00000390,
            e0: 0.00677672, edot: -0.00004107,
            i0: 3.39467605, idot: -0.00078890,
            L0: 181.97909950, Ldot: 58517.81538729,
            ap0: 131.60246718, apdot: 0.00268329,
            la0: 76.67984255, ladot: -0.27769418,
            H: -4.40, p1: 0.0009, p2: 0.000239, p3: -0.0000006
        },
        "Earth": {
            a0: 1.00000261, adot: 0.00000562,
            e0: 0.01671123, edot: -0.00004392,
            i0: -0.00001531, idot: -0.01294668,
            L0: 100.46457166, Ldot: 35999.37244981,
            ap0: 102.93768193, apdot: 0.32327364,
            la0: 0.0, ladot: 0.0,
            H: -3.86, p1: 0.0, p2: 0.0, p3: 0.0
        },
        "Mars": {
            a0: 1.52371034, adot: 0.00001847,
            e0: 0.09339410, edot: 0.00007882,
            i0: 1.84969142, idot: -0.00813131,
            L0: -4.55343205, Ldot: 19140.30268499,
            ap0: -23.94362959, apdot: 0.44441088,
            la0: 49.55953891, ladot: -0.29257343,
            H: -1.52, p1: 0.0160, p2: 0.0, p3: 0.0
        },
        "Jupiter": {
            a0: 5.20288700, adot: -0.00011607,
            e0: 0.04838624, edot: -0.00013253,
            i0: 1.30439695, idot: -0.00183714,
            L0: 34.39644051, Ldot: 3034.74612775,
            ap0: 14.72847983, apdot: 0.21252668,
            la0: 100.47390909, ladot: 0.20469106,
            H: -9.40, p1: 0.0050, p2: 0.0, p3: 0.0
        },
        "Saturn": {
            a0: 9.53667594, adot: -0.00125060,
            e0: 0.05386179, edot: -0.00050991,
            i0: 2.48599187, idot: 0.00193609,
            L0: 49.95424423, Ldot: 1222.49362201,
            ap0: 92.59887831, apdot: -0.41897216,
            la0: 113.66242448, ladot: -0.28867794,
            H: -8.88, p1: 0.0440, p2: 0.0, p3: 0.0
        },
        "Uranus": {
            a0: 19.18916464, adot: -0.00196176,
            e0: 0.04725744, edot: -0.00004397,
            i0: 0.77263783, idot: -0.00242939,
            L0: 313.23810451, Ldot: 428.48202785,
            ap0: 170.95427630, apdot: 0.40805281,
            la0: 74.01692503, ladot: 0.04240589,
            H: -7.19, p1: 0.0028, p2: 0.0, p3: 0.0
        },
        "Neptune": {
            a0: 30.06992276, adot: 0.00026291,
            e0: 0.00859048, edot: 0.00005105,
            i0: 1.77004347, idot: 0.00035372,
            L0: -55.12002969, Ldot: 218.45945325,
            ap0: 44.96476227, apdot: -0.32241464,
            la0: 131.78422574, ladot: -0.00508664,
            H: -6.87, p1: 0.0010, p2: 0.0, p3: 0.0
        }
    };

    /**
     * Initializes Starlib with a default observer configuration.
     * @param {Object} config
     * @param {number} config.lat - Observer latitude in degrees (-90 to 90)
     * @param {number} config.long - Observer longitude in degrees (-180 to 180, East positive)
     * @param {number} config.yr - Year (4-digit format)
     * @param {number} config.mo - Month (1 to 12)
     * @param {number} config.d - Day of the month (1 to 31)
     * @param {number} config.hr - Hours in 24h format (0 to 23)
     * @param {number} config.min - Minutes (0 to 59)
     * @param {number} config.tz - Timezone offset from UTC in decimal hours
     */
  
    constructor(config) {
        this.position = {
            lat: config.lat,
            long: config.long
        };
        this.time = {
            yr: config.yr,
            mo: config.mo,
            d: config.d,
            hr: config.hr,
            min: config.min,
            tz: config.tz
        };
        this.normalizeTime();
    }
    normalizeTime() {
        while (this.time.min >= 60) {
            this.time.min -= 60;
            this.time.hr += 1;
        }
        while (this.time.min < 0) {
            this.time.min += 60;
            this.time.hr -= 1;
        }
        while (this.time.hr >= 24) {
            this.time.hr -= 24;
            this.time.d += 1;
        }
        while (this.time.hr < 0) {
            this.time.hr += 24;
            this.time.d -= 1;
        }

        const daysInMonths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let safetyCounter = 0;
        
        while (safetyCounter < 1000) {
            const isLeap = (this.time.yr % 4 === 0 && this.time.yr % 100 !== 0) || (this.time.yr % 400 === 0);
            daysInMonths[2] = isLeap ? 29 : 28;
            
            if (this.time.d > daysInMonths[this.time.mo]) {
                this.time.d -= daysInMonths[this.time.mo];
                this.time.mo += 1;
                if (this.time.mo > 12) {
                    this.time.mo = 1;
                    this.time.yr += 1;
                }
            } else if (this.time.d < 1) {
                this.time.mo -= 1;
                if (this.time.mo < 1) {
                    this.time.mo = 12;
                    this.time.yr -= 1;
                }
                const prevIsLeap = (this.time.yr % 4 === 0 && this.time.yr % 100 !== 0) || (this.time.yr % 400 === 0);
                daysInMonths[2] = prevIsLeap ? 29 : 28;
                this.time.d += daysInMonths[this.time.mo];
            } else {
                break;
            }
            safetyCounter++;
        }
    }
  
    static getJulianDate(time) {
        let year = time.yr;
        let month = time.mo;
        const day = time.d;
        
        if (month <= 2) {
            year -= 1;
            month += 12;
        }

        const century = Math.floor(year / 100);
        const calendarCorrection = 2 - century + Math.floor(century / 4);
        const utcTime = time.hr + (time.min / 60) - time.tz;
        
        return Math.floor(365.25 * (year + 4716)) + 
               Math.floor(30.6001 * (month + 1)) + 
               day + calendarCorrection - 1524.5 + (utcTime / 24);
    }
  
    static getJulianCenturies(julianDate) {
        return (julianDate - 2451545.0) / 36525.0;
    }
  
    static calculateLST(julianDate, longitude) {
        const daysSinceEpoch = julianDate - 2451545.0;
        const centuriesSinceEpoch = daysSinceEpoch / 36525.0;
        
        const gmst = 280.46061837 + 
                     (360.98564736629 * daysSinceEpoch) + 
                     (0.000387933 * Math.pow(centuriesSinceEpoch, 2)) - 
                     (Math.pow(centuriesSinceEpoch, 3) / 38710000.0);
        
        return Starlib.normalizeAngle(gmst + longitude);
    }

    static normalizeAngle(deg) {
        let out = deg % 360;
        if (out < 0) { out += 360; }
        return out;
    }

    static normalizeRadians(rad) {
        const pi2 = 2 * Math.PI;
        let out = rad % pi2;
        if (out < 0) { out += pi2; }
        return out;
    }

    static solveKepler(meanAnomaly, eccentricity) {
        let eccentricAnomaly = meanAnomaly;
        const tolerance = 1e-8;
        const maxIterations = 100;
        
        for (let i = 0; i < maxIterations; i++) {
            const delta = (eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly) / 
                          (1 - eccentricity * Math.cos(eccentricAnomaly));
            eccentricAnomaly -= delta;
            if (Math.abs(delta) < tolerance) {
                break;
            }
        }
        return eccentricAnomaly;
    }

    static getPlanetaryElements(planetName, T) {
        const formattedName = planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
        const data = Starlib.PLANET_ELEMENTS[formattedName];
        if (!data) return null;

        const a = data.a0 + data.adot * T;
        const e = data.e0 + data.edot * T;
        const i = data.i0 + data.idot * T;
        const L = data.L0 + data.Ldot * T;
        const ap = data.ap0 + data.apdot * T; 
        const la = data.la0 + data.ladot * T;
      
        const omega = ap - la;
        const M = L - ap;

        return {
            a: a,
            e: e,
            i: i,
            L: Starlib.normalizeAngle(L),
            la: Starlib.normalizeAngle(la),
            omega: Starlib.normalizeAngle(omega),
            M: Starlib.normalizeAngle(M)
        };
    }

    static computeHeliocentricCoords(planetName, eccentricAnomaly, T) {
        const elements = Starlib.getPlanetaryElements(planetName, T);
        if (!elements) return null;

        const a = elements.a;
        const e = elements.e;
        const iRad = elements.i * (Math.PI / 180);
        const laRad = elements.la * (Math.PI / 180);
        const omegaRad = elements.omega * (Math.PI / 180);

        const xPrime = a * (Math.cos(eccentricAnomaly) - e);
        const yPrime = a * (Math.sqrt(1 - e * e)) * (Math.sin(eccentricAnomaly));

        const x = xPrime * (Math.cos(laRad) * Math.cos(omegaRad) - Math.sin(laRad) * Math.sin(omegaRad) * Math.cos(iRad)) - 
                  yPrime * (Math.cos(laRad) * Math.sin(omegaRad) + Math.sin(laRad) * Math.cos(omegaRad) * Math.cos(iRad));
                  
        const y = xPrime * (Math.sin(laRad) * Math.cos(omegaRad) + Math.cos(laRad) * Math.sin(omegaRad) * Math.cos(iRad)) - 
                  yPrime * (Math.sin(laRad) * Math.sin(omegaRad) - Math.cos(laRad) * Math.cos(omegaRad) * Math.cos(iRad));
                  
        const z = xPrime * (Math.sin(omegaRad) * Math.sin(iRad)) + 
                  yPrime * (Math.cos(omegaRad) * Math.sin(iRad));

        return { x, y, z };
    }

    static getObliquity(T) {
        const epsSec = 84381.448 - 46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T;
        return (epsSec / 3600.0) * (Math.PI / 180.0);
    }

    static eclipticToEquatorial(x, y, z, T) {
        const eps = Starlib.getObliquity(T);
        
        const xEq = x;
        const yEq = y * Math.cos(eps) - z * Math.sin(eps);
        const zEq = y * Math.sin(eps) + z * Math.cos(eps);

        const dist = Math.sqrt(xEq * xEq + yEq * yEq + zEq * zEq);
        const decRad = Math.asin(zEq / dist);
        let raRad = Math.atan2(yEq, xEq);
        
        return {
            ra: Starlib.normalizeAngle(raRad * (180 / Math.PI)),
            dec: decRad * (180 / Math.PI),
            distance: dist
        };
    }

    static toAltAz(ra, dec, lst, lat) {
        let hourAngle = lst - ra;
        if (hourAngle < 0) {
            hourAngle += 360;
        }

        const haRad = hourAngle * (Math.PI / 180);
        const decRad = dec * (Math.PI / 180);
        const latRad = lat * (Math.PI / 180);

        const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
        const clampedSinAlt = Math.max(-1, Math.min(1, sinAlt));
        const altRad = Math.asin(clampedSinAlt);

        const y = -Math.sin(haRad) * Math.cos(decRad);
        const x = Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(haRad);
        const azRad = Math.atan2(y, x);

        let finalAlt = altRad * (180 / Math.PI);
        let finalAz = azRad * (180 / Math.PI);

        if (finalAz < 0) {
            finalAz += 360;
        }

        return { alt: finalAlt, az: finalAz };
    }
  
    static calculatePlanetMagnitude(planetName, planetCoords, earthCoords) {
        const formattedName = planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
        const pData = Starlib.PLANET_ELEMENTS[formattedName];
        if (!pData) return 0;

        const rPlanet = Math.sqrt(planetCoords.x * planetCoords.x + planetCoords.y * planetCoords.y + planetCoords.z * planetCoords.z);
        const rEarth = Math.sqrt(earthCoords.x * earthCoords.x + earthCoords.y * earthCoords.y + earthCoords.z * earthCoords.z);

        const dx = planetCoords.x - earthCoords.x;
        const dy = planetCoords.y - earthCoords.y;
        const dz = planetCoords.z - earthCoords.z;
        const delta = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const cosBeta = (rPlanet * rPlanet + delta * delta - rEarth * rEarth) / (2 * rPlanet * delta);
        const clampedCosBeta = Math.max(-1, Math.min(1, cosBeta));
        const betaRad = Math.acos(clampedCosBeta);
        const betaDeg = betaRad * (180 / Math.PI);

        const baseMag = pData.H + 5 * (Math.log(rPlanet * delta) / Math.LN10);
        const phaseCorrection = (pData.p1 * betaDeg) + (pData.p2 * Math.pow(betaDeg, 2)) + (pData.p3 * Math.pow(betaDeg, 3));
        let finalMagnitude = baseMag + phaseCorrection;

        if (formattedName === "Saturn") {
            finalMagnitude -= 0.5; // Offset approximation for average ring tilt
        }

        return finalMagnitude;
    }

    static getPlanetPosition(planetName, time, position) {
        const normTime = Starlib.normalizeTime(time);
        const JD = Starlib.getJulianDate(normTime);
        const T = Starlib.getJulianCenturies(JD);
        const lst = Starlib.calculateLST(JD, position.long);

        const earthElements = Starlib.getPlanetaryElements("Earth", T);
        const earthE = Starlib.solveKepler(earthElements.M * (Math.PI / 180), earthElements.e);
        const earthCoords = Starlib.computeHeliocentricCoords("Earth", earthE, T);

        let targetCoords;
        let finalMagnitude = 0;
        const lowerName = planetName.toLowerCase();

        if (lowerName === "sun") {
            targetCoords = {
                x: -earthCoords.x,
                y: -earthCoords.y,
                z: -earthCoords.z
            };
            finalMagnitude = -26.74;
        } else {
            const planetElements = Starlib.getPlanetaryElements(planetName, T);
            if (!planetElements) {
                throw new Error(`Planet or Sun named "${planetName}" was not found.`);
            }
            const planetE = Starlib.solveKepler(planetElements.M * (Math.PI / 180), planetElements.e);
            const helio = Starlib.computeHeliocentricCoords(planetName, planetE, T);

            targetCoords = {
                x: helio.x - earthCoords.x,
                y: helio.y - earthCoords.y,
                z: helio.z - earthCoords.z
            };
            finalMagnitude = Starlib.calculatePlanetMagnitude(planetName, helio, earthCoords);
        }

        const eq = Starlib.eclipticToEquatorial(targetCoords.x, targetCoords.y, targetCoords.z, T);
        const altAz = Starlib.toAltAz(eq.ra, eq.dec, lst, position.lat);

        return {
            name: planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase(),
            ra: eq.ra,               // Degrees
            dec: eq.dec,             // Degrees
            alt: altAz.alt,           // Degrees
            az: altAz.az,             // Degrees
            distance: eq.distance,   // Astronomical Units
            magnitude: finalMagnitude,
            jd: JD,
            lst: lst
        };
    }

    updateObserverTime(timeUpdate) {
        Object.assign(this.time, timeUpdate);
        this.normalizeTime();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Starlib;
} else {
    window.Starlib = Starlib;
}
