/* Name codec for personalized wedding-invite URLs.
 *
 * Goal: keep links short for common Armenian given names, but still work for
 * anyone (including surnames, nicknames, Latin spelling). No build step.
 *
 * Encoded forms:
 *   - Dictionary hit   → 2–3 char ID, e.g. "m1" (masculine), "f1" (feminine)
 *   - Anything else    → "b." + base64url(UTF-8 bytes)
 *
 * Usage:
 *   const enc = WeddingCodec.encodeName('Աղասի');   // "m71"
 *   const dec = WeddingCodec.decodeName('m71');      // "Աղասի"
 *   WeddingCodec.isDictionaryHit('Աղասի');           // true
 *   WeddingCodec.ALL_NAMES                           // sorted name array for autocomplete
 *
 * Exposes a global `window.WeddingCodec` so plain <script> users and Babel-JSX
 * users can both reach it without a module system.
 */

(function () {
  // ---------- Dictionary of common Armenian given names → short IDs ----------
  // Add entries here when you see a name that's not already in the list. Only
  // effect of adding is shorter URLs — everything still works without it.
  var NAME_TO_ID = {
    // Feminine
    'Անի': 'f1', 'Անահիտ': 'f2', 'Արմինե': 'f3', 'Արփի': 'f4', 'Արփինե': 'f5',
    'Ասյա': 'f6', 'Աստղիկ': 'f7', 'Գայանե': 'f8', 'Գոհար': 'f9', 'Դիանա': 'f10',
    'Էլեն': 'f11', 'Էմմա': 'f12', 'Էվելինա': 'f13', 'Էրիկա': 'f14', 'Զարուհի': 'f15',
    'Թագուհի': 'f16', 'Թամար': 'f17', 'Թամարա': 'f18', 'Թեհմինե': 'f19', 'Լիա': 'f20',
    'Լիանա': 'f21', 'Լիլիթ': 'f22', 'Լուսինե': 'f23', 'Կարինե': 'f24', 'Հասմիկ': 'f25',
    'Հայկուհի': 'f26', 'Հերմինե': 'f27', 'Հռիփսիմե': 'f28', 'Մարիամ': 'f29', 'Մարի': 'f30',
    'Մարինե': 'f31', 'Մելինե': 'f32', 'Մելանյա': 'f33', 'Մերի': 'f34', 'Մեղրի': 'f35',
    'Միլենա': 'f36', 'Նաիրա': 'f37', 'Նանե': 'f38', 'Նարե': 'f39', 'Նարինե': 'f40',
    'Նելլի': 'f41', 'Նինա': 'f42', 'Նվարդ': 'f43', 'Շողիկ': 'f44', 'Շուշան': 'f45',
    'Ռիմա': 'f46', 'Ռուզաննա': 'f47', 'Սաթենիկ': 'f48', 'Սեդա': 'f49', 'Սիրան': 'f50',
    'Սիրանուշ': 'f51', 'Սյուզաննա': 'f52', 'Սոնա': 'f53', 'Սոֆյա': 'f54', 'Սրբուհի': 'f55',
    'Տաթևիկ': 'f56', 'Քնարիկ': 'f57', 'Քրիստինե': 'f58', 'Օֆելյա': 'f59', 'Ալինա': 'f60',
    'Անգելինա': 'f61', 'Անուշ': 'f62', 'Արեգնազ': 'f63', 'Բելլա': 'f64', 'Գրետա': 'f65',
    'Դայանա': 'f66', 'Էլինա': 'f67', 'Եվա': 'f68', 'Ինգա': 'f69', 'Իրինա': 'f70',
    'Լենա': 'f71', 'Լիզա': 'f72', 'Լուիզա': 'f73', 'Կարմեն': 'f74', 'Հայկանուշ': 'f75',
    'Մարգարիտա': 'f76', 'Մայա': 'f77', 'Մանե': 'f78', 'Մոնիկա': 'f79', 'Նատալի': 'f80',
    'Նոննա': 'f81', 'Նորա': 'f82', 'Ռուզան': 'f83', 'Սաթինե': 'f84', 'Սոնյա': 'f85',
    'Վարդուհի': 'f86', 'Վիկտորյա': 'f87', 'Աննա': 'f88',

    // Masculine
    'Արամ': 'm1', 'Արմեն': 'm2', 'Արթուր': 'm3', 'Արա': 'm4', 'Արման': 'm5',
    'Արսեն': 'm6', 'Արտակ': 'm7', 'Արտավազդ': 'm8', 'Արտյոմ': 'm9', 'Աշոտ': 'm10',
    'Բագրատ': 'm11', 'Բաբկեն': 'm12', 'Գագիկ': 'm13', 'Գառնիկ': 'm14', 'Գարեգին': 'm15',
    'Գևորգ': 'm16', 'Գոռ': 'm17', 'Դավիթ': 'm18', 'Դերենիկ': 'm19', 'Էդգար': 'm20',
    'Էդուարդ': 'm21', 'Էրիկ': 'm22', 'Հայկ': 'm23', 'Հակոբ': 'm24', 'Համբարձում': 'm25',
    'Համլետ': 'm26', 'Հարություն': 'm27', 'Հրայր': 'm28', 'Հրանտ': 'm29', 'Հովհաննես': 'm30',
    'Հովիկ': 'm31', 'Ղազար': 'm32', 'Ղուկաս': 'm33', 'Մամիկոն': 'm34', 'Մարտին': 'm35',
    'Մհեր': 'm36', 'Միհրան': 'm37', 'Մկրտիչ': 'm38', 'Մոնթե': 'm39', 'Մուշեղ': 'm40',
    'Նարեկ': 'm41', 'Ներսես': 'm42', 'Նորայր': 'm43', 'Շանթ': 'm44', 'Շավարշ': 'm45',
    'Ռաֆայել': 'm46', 'Ռոբերտ': 'm47', 'Ռուբեն': 'm48', 'Սամվել': 'm49', 'Սարգիս': 'm50',
    'Սերոբ': 'm51', 'Սերգեյ': 'm52', 'Սիմոն': 'm53', 'Սմբատ': 'm54', 'Ստեփան': 'm55',
    'Սուրեն': 'm56', 'Վազգեն': 'm57', 'Վահագն': 'm58', 'Վահան': 'm59', 'Վահե': 'm60',
    'Վարդան': 'm61', 'Վարուժան': 'm62', 'Վիգեն': 'm63', 'Վրեժ': 'm64', 'Տիգրան': 'm65',
    'Տիրան': 'm66', 'Քաջիկ': 'm67', 'Օհան': 'm68', 'Աբգար': 'm69', 'Ադամ': 'm70',
    'Աղասի': 'm71', 'Անդրանիկ': 'm72', 'Արշակ': 'm73', 'Արշավիր': 'm74', 'Գագօ': 'm75',
    'Գրիգոր': 'm76', 'Լևոն': 'm77', 'Խորեն': 'm78', 'Կարեն': 'm79', 'Կորյուն': 'm80',
    'Հմայակ': 'm81', 'Ղևոնդ': 'm82', 'Մելքոն': 'm83', 'Միքայել': 'm84', 'Յուրի': 'm85',
    'Նշան': 'm86', 'Պարգև': 'm87', 'Պետրոս': 'm88', 'Պողոս': 'm89', 'Սահակ': 'm90',
    'Սեյրան': 'm91', 'Սոս': 'm92', 'Վլադիմիր': 'm93', 'Տարոն': 'm94', 'Րաֆֆի': 'm95'
  };

  // Reverse map for decoding (ID → name).
  var ID_TO_NAME = {};
  for (var k in NAME_TO_ID) {
    if (Object.prototype.hasOwnProperty.call(NAME_TO_ID, k)) {
      ID_TO_NAME[NAME_TO_ID[k]] = k;
    }
  }

  // Sorted list for datalist/autocomplete. Armenian-aware collation.
  var ALL_NAMES = Object.keys(NAME_TO_ID).sort(function (a, b) {
    return a.localeCompare(b, 'hy');
  });

  // ---------- base64url (URL-safe base64, no padding) -----------------------
  function base64urlEncode(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64urlDecode(str) {
    var pad = str.length % 4 === 0 ? '' : new Array(5 - (str.length % 4)).join('=');
    var b64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  // ---------- Public API ----------------------------------------------------
  function encodeName(name) {
    var trimmed = (name == null ? '' : String(name)).trim();
    if (!trimmed) return '';
    var id = NAME_TO_ID[trimmed];
    if (id) return id;
    var bytes = new TextEncoder().encode(trimmed);
    return 'b.' + base64urlEncode(bytes);
  }

  function decodeName(param) {
    if (!param) return '';
    if (param.indexOf('b.') === 0) {
      try {
        return new TextDecoder().decode(base64urlDecode(param.slice(2)));
      } catch (e) {
        return '';
      }
    }
    return Object.prototype.hasOwnProperty.call(ID_TO_NAME, param)
      ? ID_TO_NAME[param]
      : param;
  }

  function isDictionaryHit(name) {
    var trimmed = (name == null ? '' : String(name)).trim();
    return !!(trimmed && Object.prototype.hasOwnProperty.call(NAME_TO_ID, trimmed));
  }

  // Read `?n=` (encoded) first, fall back to legacy `?name=` (raw).
  function readGuestNameFromUrl(search) {
    var q = new URLSearchParams(search == null ? window.location.search : search);
    var n = q.get('n');
    if (n) return decodeName(n);
    var raw = q.get('name');
    return raw || '';
  }

  window.WeddingCodec = {
    encodeName: encodeName,
    decodeName: decodeName,
    isDictionaryHit: isDictionaryHit,
    readGuestNameFromUrl: readGuestNameFromUrl,
    NAME_TO_ID: NAME_TO_ID,
    ID_TO_NAME: ID_TO_NAME,
    ALL_NAMES: ALL_NAMES
  };
})();
