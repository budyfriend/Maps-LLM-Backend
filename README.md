# 🧠 Local LLM + Google Maps Integration
(macOS Full Setup Guide + API Documentation)

This guide explains how to set up your local LLM (using Ollama + Open WebUI)
and a Node.js backend API connected to Google Maps. The LLM parses natural
language queries like “find nearby coffee shops” and the backend returns real
Google Maps data.

---
## 📋 1. Requirements
- macOS with Docker Desktop
- Node.js v18+ (optional if testing locally)
- Google Cloud Account (for Maps API)
- Basic terminal knowledge

---
## ⚙️ 2. Install Docker (macOS)
Download and install:  
🔗 [Docker for macOS](https://docs.docker.com/desktop/setup/install/mac-install/)

Check installation:
```bash
docker --version
```

---
## 🧩 3. Set Up Ollama (Local LLM Runtime)
Pull and run Ollama container:
```bash
docker pull ollama/ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama run llama3.2:3b
```
Ollama API is available at: **http://localhost:11434**

---
## 💬 4. Start Open WebUI (LLM Chat Interface)
```bash
docker run -d -p 3000:8080   --add-host=host.docker.internal:host-gateway   -v open-webui:/app/backend/data   --name open-webui   --restart always   ghcr.io/open-webui/open-webui:main
```
Access UI → **http://localhost:3000**  
(Default backend: `http://host.docker.internal:11434`)

---
## 🌍 5. Get Google Maps API Key
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (e.g. `Maps LLM Backend`)
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Go to: **APIs & Services → Credentials → + CREATE CREDENTIALS → API Key**
5. Restrict key (localhost + selected APIs)

Example:
```
GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

---
## 🧠 6. Backend Setup (Maps LLM Backend)
**Folder structure:**
```
Maps LLM Backend/
├── .env
├── server.js
├── package.json
├── .gitignore
```

**.env example:**
```
GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
LLM_API_URL=http://localhost:11434
PORT=3001
```

Install dependencies:
```bash
npm install
```

---
## 📡 7. API Documentation
All routes are prefixed with `/api`  
Base URL: `http://localhost:3001`

### 1️⃣ POST `/api/search`
**Description:**  
Accepts a natural language query (prompt) and optional user location.

**Body (JSON):**
```json
{
  "prompt": "Find nearby sushi restaurants",
  "user_location": { "lat": -6.200000, "lng": 106.816666 }
}
```

**Example curl:**
```bash
curl -X POST http://localhost:3001/api/search   -H "Content-Type: application/json"   -d '{"prompt":"find coffee shops near me","user_location":{"lat":-6.2,"lng":106.8}}'
```

**Example Response:**
```json
{
    "parsed": {
        "intent": "find",
        "place_type": "restaurant",
        "keywords": "sushi restaurant nearby",
        "radius_m": 3000,
        "limit": 50,
        "location": {
            "lat": -6.2,
            "lng": 106.816666
        }
    },
    "places": [
        {
            "place_id": "ChIJm_mBpuzxaS4RFi-v_15ufZ0",
            "name": "Morimoto Jakarta",
            "rating": 4.9,
            "user_ratings_total": 646,
            "vicinity": "District 8, SCBD, Lot 28, South Jakarta City",
            "location": {
                "lat": -6.227295300000001,
                "lng": 106.8064327
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJm_mBpuzxaS4RFi-v_15ufZ0",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.227295300000001,106.8064327"
        },
        {
            "place_id": "ChIJ3fpFb4r1aS4RqVlIvbiCuFE",
            "name": "Sushi Toku Menteng",
            "rating": 4.7,
            "user_ratings_total": 677,
            "vicinity": "Jl. Imam Bonjol No.32, RT.2/RW.5, Menteng, Kota Jakarta Pusat",
            "location": {
                "lat": -6.1991948,
                "lng": 106.8280283
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJ3fpFb4r1aS4RqVlIvbiCuFE",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.1991948,106.8280283"
        },
        {
            "place_id": "ChIJ11scZT_3aS4RDA17GWoP7Fs",
            "name": "Tazawa Izakaya",
            "rating": 4.8,
            "user_ratings_total": 449,
            "vicinity": "Senayan Park, Jl. Gerbang Pemuda Senayan Park Mall No.3 Lower Ground Unit, RT.1/RW.3, Gelora, Kota Jakarta Pusat",
            "location": {
                "lat": -6.2124964,
                "lng": 106.8049368
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJ11scZT_3aS4RDA17GWoP7Fs",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.2124964,106.8049368"
        },
        {
            "place_id": "ChIJMWYWVLT2aS4RFCIdHdxDb3o",
            "name": "Edogin",
            "rating": 4.6,
            "user_ratings_total": 1259,
            "vicinity": "Jl. Asia Afrika, Senayan, Kota Jakarta Pusat",
            "location": {
                "lat": -6.2151383,
                "lng": 106.7970056
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJMWYWVLT2aS4RFCIdHdxDb3o",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.2151383,106.7970056"
        },
        {
            "place_id": "ChIJaxrhifn1aS4RmwVcTBWxRjk",
            "name": "Gion Sushi | Citywalk Sudirman",
            "rating": 4.8,
            "user_ratings_total": 245,
            "vicinity": "Citylofts Sudirman, Jl. K.H. Mas Mansyur No.121, RT.10/RW.11, Karet Tengsin, Kota Jakarta Pusat",
            "location": {
                "lat": -6.2090203,
                "lng": 106.8181224
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJaxrhifn1aS4RmwVcTBWxRjk",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.2090203,106.8181224"
        },
        {
            "place_id": "ChIJD32mBIj1aS4RJ_MALCXa5DE",
            "name": "Aomori Shokudo Kuningan - Japanese Restaurant",
            "rating": 4.7,
            "user_ratings_total": 666,
            "vicinity": "Jl. Karbela No.1, Kuningan, Village, Kota Jakarta Selatan",
            "location": {
                "lat": -6.2149131,
                "lng": 106.8282482
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJD32mBIj1aS4RJ_MALCXa5DE",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.2149131,106.8282482"
        },
        {
            "place_id": "ChIJV_ff9PT1aS4RN7GFZAWGMmU",
            "name": "Sushi Hiro, sarinah",
            "rating": 4.9,
            "user_ratings_total": 3390,
            "vicinity": "Sarinah, Jl. M.H. Thamrin No.11, RT.8/RW.4, Gondangdia, Kota Jakarta Pusat",
            "location": {
                "lat": -6.1874207,
                "lng": 106.823795
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJV_ff9PT1aS4RN7GFZAWGMmU",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.1874207,106.823795"
        },
        {
            "place_id": "ChIJUUfD-r31aS4RpjUzDCMEcW4",
            "name": "Kintaro Sushi PI (Plaza Indonesia)",
            "rating": 4.9,
            "user_ratings_total": 1338,
            "vicinity": "Jl. M.H. Thamrin No.kav 28-30 LT. Basement. Unit LB #25, Gondangdia, Jakarta",
            "location": {
                "lat": -6.1938545,
                "lng": 106.8220282
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJUUfD-r31aS4RpjUzDCMEcW4",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.1938545,106.8220282"
        },
        {
            "place_id": "ChIJPw1c-Vj3aS4RkqRbPYZGw6E",
            "name": "Furusato Izakaya",
            "rating": 4.8,
            "user_ratings_total": 3046,
            "vicinity": "The Orient Hotel Jakarta, Jl. Jend. Sudirman No.36 Ground Floor, Bend. Hilir, Kota Jakarta Pusat",
            "location": {
                "lat": -6.215408099999999,
                "lng": 106.8161436
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJPw1c-Vj3aS4RkqRbPYZGw6E",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.215408099999999,106.8161436"
        },
        {
            "place_id": "ChIJ_eFcy4f1aS4RxLSWT5PhCAs",
            "name": "Wabi-Sabi Restaurant",
            "rating": 4.8,
            "user_ratings_total": 445,
            "vicinity": "MD Place, Jl. Setia Budi Selatan No.7 12th Floor, RT.5/RW.1, Kuningan, Karet Kuningan, Kota Jakarta Selatan",
            "location": {
                "lat": -6.2081681,
                "lng": 106.8284888
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJ_eFcy4f1aS4RxLSWT5PhCAs",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.2081681,106.8284888"
        },
        {
            "place_id": "ChIJJXGInhf0aS4RlJxUs4K3yRM",
            "name": "Midori Japanese Restaurant",
            "rating": 4.7,
            "user_ratings_total": 3678,
            "vicinity": "14, Jl. K.H. Wahid Hasyim No.106, RT.14/RW.3, Kb. Sirih",
            "location": {
                "lat": -6.1867632,
                "lng": 106.8265831
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJJXGInhf0aS4RlJxUs4K3yRM",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.1867632,106.8265831"
        },
        {
            "place_id": "ChIJV5beCRXzaS4R28MNPjTOr2E",
            "name": "Sushi Hiro One Satrio",
            "rating": 4.9,
            "user_ratings_total": 3986,
            "vicinity": "Jl. Prof. DR. Satrio, RT.5/RW.2, Kuningan, Kuningan Tim., Kota Jakarta Selatan",
            "location": {
                "lat": -6.225965,
                "lng": 106.8260975
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJV5beCRXzaS4R28MNPjTOr2E",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.225965,106.8260975"
        },
        {
            "place_id": "ChIJnV8F3NP1aS4RP07ZrL_A7sU",
            "name": "GION Sushi Chillax Sudirman",
            "rating": 4.8,
            "user_ratings_total": 1452,
            "vicinity": "Jl. Jenderal Sudirman No.Kav.23, RT.10/RW.1, Kuningan, Karet Kuningan, Kota Jakarta Selatan",
            "location": {
                "lat": -6.2114017,
                "lng": 106.8210301
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJnV8F3NP1aS4RP07ZrL_A7sU",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.2114017,106.8210301"
        },
        {
            "place_id": "ChIJv5uWAaj2aS4Rslv0wfYRRVY",
            "name": "HOKKAIDO IZAKAYA",
            "rating": 4.4,
            "user_ratings_total": 1401,
            "vicinity": "Pavilion Retail Arcade Lt. Dasar Unit D 01-12 Jl. K.H Mas Mansyur Kav.24, RT.12, RW.11, Karet Tengsin, Tanah Abang, RT.12/RW.11, Karet Tengsin, Kota Jakarta Pusat",
            "location": {
                "lat": -6.208413999999999,
                "lng": 106.818007
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJv5uWAaj2aS4Rslv0wfYRRVY",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.208413999999999,106.818007"
        },
        {
            "place_id": "ChIJd395EX7zaS4REiNqStlUnC8",
            "name": "Sushi-Ya Kota Kasablanka",
            "rating": 4.6,
            "user_ratings_total": 1068,
            "vicinity": "Kota Kasablanka, Jl. Raya Casablanca, RT.2/RW.12, Menteng Dalam, Kota Jakarta Selatan",
            "location": {
                "lat": -6.222307,
                "lng": 106.8427626
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJd395EX7zaS4REiNqStlUnC8",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.222307,106.8427626"
        },
        {
            "place_id": "ChIJFwqBHl_2aS4RsksVtySf8E8",
            "name": "Sushi Hiro",
            "rating": 4.8,
            "user_ratings_total": 6535,
            "vicinity": "Jalan Letjen S. Parman Kav. 28, UG - 105 Neo Soho Mall, RT.3/RW.5, Tj. Duren Sel., Jakarta",
            "location": {
                "lat": -6.174619,
                "lng": 106.790217
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJFwqBHl_2aS4RsksVtySf8E8",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.174619,106.790217"
        },
        {
            "place_id": "ChIJEUx-oe71aS4R-HFQaChrF-I",
            "name": "Soten Japanese Charcoal Grill",
            "rating": 4.9,
            "user_ratings_total": 165,
            "vicinity": "Jl. Cut Mutia No.4, RT.4/RW.9, Dukuh Atas, Kb. Sirih, Kota Jakarta Pusat",
            "location": {
                "lat": -6.1866705,
                "lng": 106.8354421
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJEUx-oe71aS4R-HFQaChrF-I",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.1866705,106.8354421"
        },
        {
            "place_id": "ChIJWzUS5EkDai4RfZKSyL3JnvU",
            "name": "OKINAWA SUSHI CENTRAL PARK",
            "rating": 5,
            "user_ratings_total": 9391,
            "vicinity": "Central Park Mall, No.Kav. 28, Letjen S. Parman, South Tanjung Duren, West Jakarta City",
            "location": {
                "lat": -6.1780596,
                "lng": 106.7909298
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJWzUS5EkDai4RfZKSyL3JnvU",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.1780596,106.7909298"
        },
        {
            "place_id": "ChIJQWScPTnzaS4RnD24nGmZFt4",
            "name": "Gion The Sushi Bar Lotte",
            "rating": 4.8,
            "user_ratings_total": 1307,
            "vicinity": "3F, Lotte shopping avenue, RT.18/RW.4, Kuningan, Karet Kuningan, South Jakarta City",
            "location": {
                "lat": -6.224465599999999,
                "lng": 106.8228743
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJQWScPTnzaS4RnD24nGmZFt4",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.224465599999999,106.8228743"
        },
        {
            "place_id": "ChIJeRPCN1DxaS4RYT-tnnojNsk",
            "name": "Fukuro Dining & Sake Bar",
            "rating": 4.5,
            "user_ratings_total": 361,
            "vicinity": "KawaJl. Jend. Sudirman Kav. 52-53, Lot 14 Senayan Kebayoran Baru Kawasan Niaga SCBD Sudirman, RT.5/RW.3, Senayan",
            "location": {
                "lat": -6.226063,
                "lng": 106.8075215
            },
            "maps_url": "https://www.google.com/maps/search/?api=1&query=place_id:ChIJeRPCN1DxaS4RYT-tnnojNsk",
            "directions_url": "https://www.google.com/maps/dir/-6.2,106.816666/-6.226063,106.8075215"
        }
    ]
}
```

---

### 2️⃣ GET `/api/place/:placeId`
**Description:**  
Fetches detailed information for a specific place by `place_id`.

**Example:**
```bash
curl http://localhost:3001/api/place/ChIJN1t_tDeuEmsRUsoyG83frY4
```

**Response:**
```json
{
    "html_attributions": [],
    "result": {
        "formatted_address": "Ground Floor/48 Pirrama Rd, Pyrmont NSW 2009, Australia",
        "formatted_phone_number": "(02) 9374 4000",
        "geometry": {
            "location": {
                "lat": -33.866489,
                "lng": 151.1958561
            },
            "viewport": {
                "northeast": {
                    "lat": -33.8655112697085,
                    "lng": 151.1971156302915
                },
                "southwest": {
                    "lat": -33.8682092302915,
                    "lng": 151.1944176697085
                }
            }
        },
        "name": "Google Sydney - Pirrama Road",
        "opening_hours": {
            "open_now": false,
            "periods": [
                {
                    "close": {
                        "day": 1,
                        "time": "1730"
                    },
                    "open": {
                        "day": 1,
                        "time": "0830"
                    }
                },
                {
                    "close": {
                        "day": 2,
                        "time": "1730"
                    },
                    "open": {
                        "day": 2,
                        "time": "0830"
                    }
                },
                {
                    "close": {
                        "day": 3,
                        "time": "1730"
                    },
                    "open": {
                        "day": 3,
                        "time": "0830"
                    }
                },
                {
                    "close": {
                        "day": 4,
                        "time": "1700"
                    },
                    "open": {
                        "day": 4,
                        "time": "0830"
                    }
                },
                {
                    "close": {
                        "day": 5,
                        "time": "1700"
                    },
                    "open": {
                        "day": 5,
                        "time": "0830"
                    }
                }
            ],
            "weekday_text": [
                "Monday: 8:30 AM – 5:30 PM",
                "Tuesday: 8:30 AM – 5:30 PM",
                "Wednesday: 8:30 AM – 5:30 PM",
                "Thursday: 8:30 AM – 5:00 PM",
                "Friday: 8:30 AM – 5:00 PM",
                "Saturday: Closed",
                "Sunday: Closed"
            ]
        },
        "photos": [
            {
                "height": 3024,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/117600448889234589608\">Cynthia Wei</a>"
                ],
                "photo_reference": "AWn5SU6s4rVOH9tRd3NZ8dA3_NaRoCB0Btt9BK9lCu_qHnPxASBtkphLdzwEvxv070a9UFQNqk_M_1nPz5R0NipnPvN-_MFno90M4xDHCd_ISC33ZYpsNfvkkK8Ly4cD_i3ELRqYixhbftt8SSQzN_2NBZPjKuLu4-088Stm6QFn9x0WOaq7Lv7Ozm0x2tQ0XfnBTjSxa-DVK4L2bknUDBjLETrVdoDqnfIAojI59BxHxJrWVGHsrEdzrZ0Sskd15kZE7y_DGngVcvuEkHbOtIwoGI4EUf6KvOauopp2JSfVEiEliIeiU37ODwE_ZetKc8MBcGvvCMSIS_AZxb6rp6Omqco3NEMJOkTjt4gar5eOwyBniLO39ufFAK--SODJG_odGPhoSd3opc5esMi6dkEl-gTnrD1aPC3t_M_HFO8VtvA294gL",
                "width": 4032
            },
            {
                "height": 4000,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/117351006581217688918\">John karmas</a>"
                ],
                "photo_reference": "AWn5SU7I0j2pnH4yj8QqJVoaN_YYuP8W1sGSWsGvz3JNoILHbw1sG7qTTKUw2tG1cd-gwUIYLnH8QhWkWT2MuzZycc27YfTL3WYN9faHZunUHE4aLANkFd__mL6kfPdEQUfX3nBsSObMc4yV5qqFyxEpVu77UxGJusGNvmWvDYa1NeK1180j7iXe5leznyxoH1l4eJJYAYWt4hPESWDFTHnmfGlD4H3Ez_OE7SPUVhRWBKAFisvj-LKevxbJPMfZ0VoYDgBsPZ8yMvHe7y9PVYl3DnZNxBD2wQqH1rRIFSB6z4yOiwnEDKy5ByE3Xs1Q41C9hmXGMcVRW12Ya39dN9m1HsD6oN-9K5W7-fsqIXEPixssT7VT_tUqKcqJVoDVRcqVo11KaOP8tPqN-ghY-wa09Vdzm_IHfXVvVyjeS3dvYoBv__Y",
                "width": 3000
            },
            {
                "height": 3024,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/114103830460746744751\">manhdung nguyen</a>"
                ],
                "photo_reference": "AWn5SU7W4-fhUCCZUj9i7gB0RGgwAphZE7x24ewMoeX0eUXkQ20zzXDvp-_3KXPivHVVWhJ1CCul6Ti_S69rv6fwqoxOHoUv8KQFsOIF0GGv1qZiXh98JRbTyhkmsLRGNu8qT1gpgvoKCzSwd6GqEGatASDxeuINV_9Rnz3GUD9dhkJmBAH8fphFVJ5-AGylhqxv4NwSxnbsTC-eMEK5O7v9ArtA5HO6ftiPJf7U6V8zLzMbKMW25j-JL_A77mhIc4Iz_XnREpaMU9FplAk3v55Sw4L-X0jNb3yHfQ4Ziti0011iB_f1wVo5exb02QfF73amuTIPLw-v7dcA7PdOSlS3SDEDoTt0k7JiR4j5E5Riul2jQ_cybBta2Vf0WD-escsFL5A5cUh08K1WQo9ok0nUtYF7nsAI5Ku39tw1PvxBlcVl3Q",
                "width": 4032
            },
            {
                "height": 3921,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/102987930970147458128\">Garrett N.</a>"
                ],
                "photo_reference": "AWn5SU6_Dr3R4LuhXbYvA0nM4vQPCKJK-3cKv83lqxEUpsyToD6FJ_pXDjLB8Lmoo6TzjQUrU7RLLaR6rQG8TLiAKjXyB79gjsZCHRSs-0IB4ClWNDh1s8-P8ijICJIcYZ_EgOwZ4evzO0H6_aWPd1e-wdyPIe2SOkEs81R_Qh0421A9jwcVuPpqT_dDjdGLBOurrAqlAXMx2fhiy6QLmXFnOB86SIe_Lxc9gYGdbZjDd1do2uPbDPB7wFDTSaHYFNmXOLIKfeZdgY3PYuc1c7C9HjChclGeB37ijgDWCvKmAExpJsyfTyHcLvVswlVDF0c-IUV9DMFCvknuZgBvX-5gG_Af-LOvYd7VUCq69dKW1fue9zNF8cDu0KYq2sdlTDZq2gmwpLix33cShPD9T1qgVy5cMC5zWO-evfDjxILzywjrDeEs",
                "width": 2941
            },
            {
                "height": 2432,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/114858570056204926877\">Geoff Wong</a>"
                ],
                "photo_reference": "AWn5SU75XAD4QyY73WIDSy-Hh1M5UGG2R8UKcIRNPDIL7dC_Wvu_1qVg4l1ctyM1rhvoXtWfDUHAmwCtkQdhKrfB9XXquaz27PketGLJ0HjeyRrQShv6Z6VH6e23E3-OYp978rQTuJ-jcxDllvJzMi1qiTDl96aD-KC9-RJfMvh9vDvJ_l9djBJXA2FKs_uo5OY1A9Z3v2tS1fUd_LFamE2tY2dlUgzUhiE3_m8wVWtfXYntD4EwqcvshuGY6xERxZH_7McqO1scLnkW-EoK_ywPrluW3NlWsMi54gIPlPejVocIdIlnuQ4DZJgDdacRYI7_NP9r1yhRrqTcO6jX9XcXIyxDxqNPeJeRcQY5WylhQmtIohy93ANd8YqnMagyHJlNuX9lnYxYxi6IwEbJnkr5N8JodoyQVTw6IlyuSDvBsKjb5g",
                "width": 3286
            },
            {
                "height": 3024,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/116488634792434467902\">Stephanie Howell</a>"
                ],
                "photo_reference": "AWn5SU4bBp5CetuhNoe_QLj4i8ykHL09MYGCzjTvNhaPG_U7YyukLlUH8oJFwTg0v2sCY93xlaSCV4TBVklPZVKWTXkXEF8zSuHbe6aQ4TXFoA5ZP3uZnJx34sOB4pGtzcVA66Ij7nwDJHi5IwIDWVJVWBYsu5p3NOPny5Ms0z9gJOTpPuQhsGixFXgH3W1RCJ6E98EhzlpnnCRjs18ddI0m-PGdvQYbR1mXnVYt-LhRedR1RQhj7j7rkCWW5-CDiBlEh-vsoFWoiVUG08GdMVRoP-ZjMYItzBdlIB_tpbsNkpvF0W1FHbKiqYc9ln_1zTNpLHHT5jTjaAZ9PlYk0HNPIvTUd1Vn8GID_MF9UVqEgZ4fFtH6Yn90bs-tiHxP-y5iHWS4MpdS7xg6vmhUJKJgz-BwohdI4FMzTt-lqzxsdqiBm9s",
                "width": 4032
            },
            {
                "height": 2448,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/113215700310354500095\">Shahid Vayani</a>"
                ],
                "photo_reference": "AWn5SU65qrKS2ly0aFL1T_TUyIawIbbXE9llDSgXPXfvbXjf6Jie68HmAN8jOKT9Q6hnKIjHvezDRFHGmPS3O8xL20Z6G809q2bVN61HrTNPzrpGfaS0e2iFF6eXOfipfg0v-TKqSyb-w4gcON44HLOJtbQST_jnu4vTALB1UTsWETaGKIdBCjt9sP2maHeBMVR2jJNNSAYxwaoWtf-GQKKWNurdqaqN3m6BCUi1jDBHgN-8IpcQDYE1TSSyXT1VlvrYGYIkV_toJ28n2Nk5fSQJPteu-V0CXNxx5ml9U2CcGFsTDeKxAWHePMe0JN-lBlWARoXF5e5iP0kzAhkIOsIfl21K-u6w4riTozSo4g-SUBllBhzjcexLpkpywJz0co1TFZSLuR1Hw8STEkkNNkAdWLcnD3PS99VAQAiAHZ81vZ5FHSTT",
                "width": 3264
            },
            {
                "height": 3024,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/114407633649912979337\">Muthuramakrishnan Viswanathan</a>"
                ],
                "photo_reference": "AWn5SU59MDPm3-XQqWNMIC2DbKQo0R-zzK8C2dVwToBoqYBPHG5Uko2g-GWc-9wmPSdyvM8TQObQZ6ziT6BTRFBIftaBJAX8yc3IPm9nYkPw-Ki83705df0Z1YRrJDIrPY9X7WsJ-VnFNTU10lwDg5VaRqoN7XjSQ9lWoLmRiLCreb5lN0NsaFdqlhCpAtzLaBctIdnHgfbILKFYdl5yGMWqHyDYrIahdMEIOD3LI8w4lOFRYYFVfh7SIAA-g0mtwH86VHl9R-5g826kH6pwp2Ujfxg1KVXcGhvUDwLDpjF1ZWSaPMvYT_6dyfHHVA0BdDd4YvLrgjTgv-x_t0UykZBlxGi2JQnsbdRWUKTw4u6sicZlvu4XspzGVruMeyw8FLyzZSdY6XKiRz_irvABkOrl-TQkEOnZY6U1agelQ5UKaqqjhnxp",
                "width": 4032
            },
            {
                "height": 498,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/103245129386449712319\">Simon TestOne</a>"
                ],
                "photo_reference": "AWn5SU46MvbkoSWYvN80PXcDQ60_NsbBYdpUeooC-mXILoQh6XbNeWvxX5l6JKAAQhHTBthfpYz1hXXdayPRpOpRTM1r7U0ZqV_FGkK1Kob-eKeApywRwDF4ZUduSIcXFgxa4k67jUpc1H3qE5x9FsZnQrYRaSFi_uJoSTtJCuKuJqN_TGywwrGq0wZ1UsuRM1jNcBt476D3h9N1_jNyL8KHipe5JoDGnvbrfMI_qDsFhAImR8wDpeAzpYqxeoFBMdfIaXEgo83hjWC9LhOc13IqYTWkC_3bTYbmzkpYzTI_fEyeAHYuM4Xlio1lmmVHGFwiQYj5jKEfu1l7mJCWgY8_ftBRy5_ioDnYEremLmifTwI8SJCfhYfYMOVAa9PuUHdbGBto9FE4oX9pm2QLJE7rg63FMITZ85agnnkXvx6Wb_D8Hg",
                "width": 750
            },
            {
                "height": 1184,
                "html_attributions": [
                    "<a href=\"https://maps.google.com/maps/contrib/106645265231048995466\">Malik</a>"
                ],
                "photo_reference": "AWn5SU4kuGjoElkneE3TfE4duMLXoomItsj4jm6-tBeaGZwZID91E0nKjiowbrkV3EUgHSwSJmdIrN_QMXB9CLDY46USaM9_Cjc5ZYHxRL6mGMkI2GUNvfjkt9bDyKJDQo9k03tf5cuuTJu5QcIkevUXCdTxiYvB7N0uRD1Cp6Bp6FS4x2Ym3EsjAEokmf7eyPSeyidQrof74GZAMzdGVtWUst_oW0m09GM0efqCYABsYBzdkZCM7yI4YspK6ig4AHnGXjjtLCIm25rWTOvRj_XFb2RZ3rP5HQ_R4J6_7vOAUE8XZo-L4-a4Ip3lt1DeD15_rPQWazgiJIiozHtE6w0mUvQsKhYW9pmHJEJN7zEnFYAKTd57PoviIetyLcb1UjpB-pqSkRYKxTHBrv1r_KmHkFJWxvQP8OBpwrdAvY_EcMk",
                "width": 1776
            }
        ],
        "rating": 4.1,
        "user_ratings_total": 1271,
        "website": "http://google.com/"
    },
    "status": "OK"
}
```

---

### 3️⃣ GET `/api/directions`
**Description:**  
Returns a Google Maps direction link between origin and destination place.

**Query Params:**
- `origin`: "lat,lng"
- `destination_place_id`: Google Maps Place ID

**Example:**
```bash
curl "http://localhost:3001/api/directions?origin=-6.2,106.8&destination_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

**Response:**
```json
{
    "directions_url": "https://www.google.com/maps/dir/-6.2,106.8/-33.866489,151.1958561"
}
```

---
## 🚀 8. Run Backend
```bash
node server.js
```
Server running at:  
👉 [http://localhost:3001](http://localhost:3001)

---
## 🧪 9. Test All
- LLM: [http://localhost:11434](http://localhost:11434)
- Open WebUI: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001/api/search](http://localhost:3001/api/search)

---
## 📚 References
- [Ollama Documentation](https://ollama.com/library)
- [Open WebUI GitHub](https://github.com/open-webui/open-webui)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)

---
👨‍💻 **Author**  
Author: Budiono | Platform: macOS | Version: 1.0.0