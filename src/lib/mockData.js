// mockData.js for Demo / Mock Mode when Supabase is not configured

export const MOCK_CHANNELS = {
  "easy_german": {
    "title": "Easy German",
    "thumbnail_url": "https://yt3.ggpht.com/ytc/AIdro5kB-h3jP_1X2o7mO1b7m_9o3m4o3m4o3m4o3m=s176-c-k-c0x00ffffff-no-rj"
  },
  "slow_german": {
    "title": "Slow German by Annik Rubens",
    "thumbnail_url": "https://yt3.ggpht.com/ytc/AIdro5lW3_OQvE4W5Qx_W0Wz-Y5bE1-Zt03-c0x00ffffff-no-rj"
  },
  "deutsch_mit_marija": {
    "title": "Deutsch mit Marija",
    "thumbnail_url": "https://yt3.ggpht.com/ytc/AIdro5mX2_mO3n5P_2z_3o=s176-c-k-c0x00ffffff-no-rj"
  }
};

export const MOCK_VIDEOS = [
  {
    "id": "dCwS5Lnt4Xg",
    "channel_id": "easy_german",
    "title": "How to order food in German - Intermediate Lesson (B1)",
    "duration": 480,
    "wpm": 125,
    "cefr_level": "B1",
    "ai_explanation": "The video features natural spoken speed but simplified sentence structures. Common vocabulary related to ordering in restaurants, using conditionals like 'Ich hätte gerne' and prepositions like 'mit/ohne'. Dative/Accusative usage is standard.",
    "grammar_tags": ["Conditionals", "Prepositions", "Dative case"],
    "status": "published",
    "channels": MOCK_CHANNELS["easy_german"],
    "created_at": "2026-06-20T10:00:00Z",
    "subtitles": [
      { "text": "Hallo zusammen! Heute sind wir in einem Restaurant.", "start": 0.5, "duration": 3.2 },
      { "text": "Wir möchten lernen, wie man auf Deutsch Essen bestellt.", "start": 4.0, "duration": 4.1 },
      { "text": "Es ist eigentlich gar nicht so schwer, wenn man die richtigen Sätze kennt.", "start": 8.5, "duration": 5.0 },
      { "text": "Der Kellner kommt meistens und fragt: Was darf ich Ihnen bringen?", "start": 14.0, "duration": 4.5 },
      { "text": "Darauf antworten wir höflich: Ich hätte gerne ein Schnitzel.", "start": 19.0, "duration": 4.8 },
      { "text": "Oder: Für mich bitte ein Wasser ohne Kohlensäure.", "start": 24.2, "duration": 3.9 },
      { "text": "Gleich testen wir das mit einem echten Kellner hier.", "start": 28.5, "duration": 3.8 }
    ]
  },
  {
    "id": "q4y8y7Z2W8Q",
    "channel_id": "slow_german",
    "title": "Deutsche Feiertage - Elementary Reading (A2)",
    "duration": 320,
    "wpm": 95,
    "cefr_level": "A2",
    "ai_explanation": "Very slow and articulate pronunciation. Sentences are short and rely on main clauses. Present tense (Präsens) is dominant. Features simple relative clauses and basic conjunctions like 'weil'.",
    "grammar_tags": ["Weil-Sätze", "Relative Clauses", "Present Tense"],
    "status": "published",
    "channels": MOCK_CHANNELS["slow_german"],
    "created_at": "2026-06-19T10:00:00Z",
    "subtitles": [
      { "text": "In Deutschland gibt es viele gesetzliche Feiertage.", "start": 1.0, "duration": 4.0 },
      { "text": "Einige Feiertage sind in allen Bundesländern gleich.", "start": 5.5, "duration": 4.5 },
      { "text": "Zum Beispiel der erste Mai oder der Tag der Deutschen Einheit.", "start": 10.5, "duration": 5.2 },
      { "text": "Viele Menschen müssen an diesen Tagen nicht arbeiten,", "start": 16.2, "duration": 4.8 },
      { "text": "weil die Geschäfte und Büros geschlossen bleiben.", "start": 21.5, "duration": 4.2 },
      { "text": "Man verbringt die Zeit oft mit der Familie.", "start": 26.0, "duration": 3.5 }
    ]
  },
  {
    "id": "e_z2W8Q_abc",
    "channel_id": "deutsch_mit_marija",
    "title": "Passiv im Hauptsatz und Nebensatz - Advanced Grammar (B2/C1)",
    "duration": 720,
    "wpm": 155,
    "cefr_level": "B2",
    "ai_explanation": "Fast native speed tutorial focusing heavily on Passive Voice (Vorgangspassiv & Zustandspassiv) across various tenses (Präteritum, Perfekt, Plusquamperfekt) and complex subordinate clauses.",
    "grammar_tags": ["Passiv", "Subordinate Clauses", "Tenses"],
    "status": "published",
    "channels": MOCK_CHANNELS["deutsch_mit_marija"],
    "created_at": "2026-06-18T10:00:00Z",
    "subtitles": [
      { "text": "Herzlich willkommen! Heute sprechen wir über das Passiv.", "start": 0.5, "duration": 3.5 },
      { "text": "Das Passiv wird im Deutschen sehr häufig benutzt, besonders in Berichten.", "start": 4.5, "duration": 5.0 },
      { "text": "Es gibt das Vorgangspassiv, das mit dem Hilfsverb 'werden' gebildet wird.", "start": 10.0, "duration": 5.5 },
      { "text": "Beispiel: Der Brief wird von mir geschrieben.", "start": 16.0, "duration": 3.8 },
      { "text": "Und das Zustandspassiv zeigt das Ergebnis mit dem Hilfsverb 'sein'.", "start": 20.2, "duration": 5.1 },
      { "text": "Beispiel: Der Brief ist geschrieben. Alles klar?", "start": 25.8, "duration": 4.0 }
    ]
  }
];

export const MOCK_PENDING_VIDEOS = [
  {
    "id": "yt_pending_1",
    "channel_id": "easy_german",
    "title": "Gespräche über Politik auf der Straße - Advanced Review (C1)",
    "duration": 540,
    "wpm": 165,
    "cefr_level": "C1",
    "ai_explanation": "Features street interviews with native speakers talking at high speeds with colloquial expressions, idioms, and complex subjunctive mood (Konjunktiv II) formulations. Requires high listening comprehension.",
    "grammar_tags": ["Konjunktiv II", "Idioms", "Colloquial German"],
    "status": "ai_reviewed",
    "channels": MOCK_CHANNELS["easy_german"],
    "created_at": "2026-06-21T12:00:00Z",
    "subtitles": [
      { "text": "Was denken Sie über die kommenden Wahlen?", "start": 1.0, "duration": 3.0 },
      { "text": "Wenn ich jünger wäre, würde ich mich mehr engagieren.", "start": 4.5, "duration": 4.5 },
      { "text": "Heutzutage wird alles so kompliziert dargestellt.", "start": 9.5, "duration": 3.8 }
    ]
  },
  {
    "id": "yt_pending_2",
    "channel_id": "slow_german",
    "title": "Der Kölner Dom - History Lesson (B1)",
    "duration": 400,
    "wpm": 115,
    "cefr_level": "B1",
    "ai_explanation": "Slightly slowed down pronunciation, describing historical events. Incorporates relative clauses and passive voice in past tense (Präteritum Passiv). Suitable for intermediate learners.",
    "grammar_tags": ["Passiv", "Relative Clauses", "Präteritum"],
    "status": "ai_reviewed",
    "channels": MOCK_CHANNELS["slow_german"],
    "created_at": "2026-06-21T11:00:00Z",
    "subtitles": [
      { "text": "Der Kölner Dom ist eine der bekanntesten Kirchen der Welt.", "start": 1.0, "duration": 4.2 },
      { "text": "Der Grundstein wurde im Jahr zwölfhundertachtundvierzig gelegt.", "start": 5.5, "duration": 4.8 },
      { "text": "Es dauerte über sechshundert Jahre, bis er fertiggestellt wurde.", "start": 10.8, "duration": 5.2 }
    ]
  }
];
