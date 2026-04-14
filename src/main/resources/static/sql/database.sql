-- ============================================================
-- BEA Gestion Projets — Schéma SQLite complet
-- Fichier : create_database.sql
-- Usage   : sqlite3 gestion.db < create_database.sql
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 30000;
PRAGMA foreign_keys = ON;

-- ── Sequences (remplace GenerationType.SEQUENCE de Hibernate) ──────────────
CREATE TABLE IF NOT EXISTS hibernate_sequence (
    next_val INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO hibernate_sequence VALUES (1);

CREATE TABLE IF NOT EXISTS users_seq (
    next_val INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO users_seq VALUES (1);

CREATE TABLE IF NOT EXISTS projets_seq (
    next_val INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO projets_seq VALUES (1);

CREATE TABLE IF NOT EXISTS notifications_seq (
    next_val INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO notifications_seq VALUES (1);

CREATE TABLE IF NOT EXISTS problemes_seq (
    next_val INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO problemes_seq VALUES (1);

CREATE TABLE IF NOT EXISTS remarques_seq (
    next_val INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO remarques_seq VALUES (1);

-- ── Table : users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY,
    matricule TEXT    NOT NULL UNIQUE,
    nom       TEXT    NOT NULL,
    prenom    TEXT    NOT NULL,
    email     TEXT    UNIQUE,
    password  TEXT    NOT NULL,
    role      TEXT    NOT NULL CHECK(role IN (
                'ADMIN','DIRECTEUR','CHEF_DEPARTEMENT',
                'INGENIEUR_ETUDE_PMO','DEVELOPPEUR')),
    telephone TEXT
);

-- ── Table : projets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projets (
    id              INTEGER PRIMARY KEY,
    nom             TEXT    NOT NULL,
    description     TEXT,
    date_creation   TEXT,
    date_debut      TEXT,
    deadline        TEXT,
    statut          TEXT    CHECK(statut IN (
                        'EN_COURS','NON_COMMENCE',
                        'CLOTURE','PAS_DE_VISIBILITE')),
    type            TEXT    CHECK(type IN ('INTERNE','EXTERNE')),
    priorite        TEXT    CHECK(priorite IN ('Haute','Moyenne','Basse')),
    chef_projet_id  INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- ── Table : notifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id            INTEGER PRIMARY KEY,
    titre         TEXT,
    message       TEXT,
    type          TEXT,
    lue           INTEGER NOT NULL DEFAULT 0,
    user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date_creation TEXT,
    projet_id     INTEGER,
    projet_nom    TEXT
);

-- ── Table : problemes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS problemes (
    id               INTEGER PRIMARY KEY,
    titre            TEXT    NOT NULL,
    description      TEXT,
    priorite         TEXT    CHECK(priorite IN ('CRITIQUE','HAUTE','MOYENNE','BASSE')),
    statut           TEXT    DEFAULT 'OUVERT'
                            CHECK(statut IN ('OUVERT','EN_COURS','RESOLU','FERME')),
    declarant_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    projet_id        INTEGER REFERENCES projets(id) ON DELETE SET NULL,
    date_creation    TEXT,
    date_resolution  TEXT,
    commentaire_pmo  TEXT
);

-- ── Table : remarques ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS remarques (
    id            INTEGER PRIMARY KEY,
    contenu       TEXT    NOT NULL,
    auteur_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    projet_id     INTEGER REFERENCES projets(id) ON DELETE CASCADE,
    date_creation TEXT
);

-- ── Index pour les requêtes fréquentes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lue     ON notifications(user_id, lue);
CREATE INDEX IF NOT EXISTS idx_problemes_declarant   ON problemes(declarant_id);
CREATE INDEX IF NOT EXISTS idx_remarques_projet      ON remarques(projet_id);
CREATE INDEX IF NOT EXISTS idx_projets_chef          ON projets(chef_projet_id);

-- ── Données initiales (comptes de démo) ──────────────────────────────────────
-- Mot de passe hashé BCrypt de "admin123"
INSERT OR IGNORE INTO users (id, matricule, nom, prenom, email, password, role)
VALUES (1, 'ADM001', 'System', 'Admin', 'admin@bea.dz',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lOzu', 'ADMIN');

-- Mot de passe hashé BCrypt de "dir123"
INSERT OR IGNORE INTO users (id, matricule, nom, prenom, email, password, role)
VALUES (2, 'DIR001', 'BEA', 'Directeur', 'directeur@bea.dz',
        '$2a$10$VFkw96xyPVUvEMmfUWL9dujS3nVKGtHHG5pNHN8zXFBizh2kLnUUq', 'DIRECTEUR');

-- Mot de passe hashé BCrypt de "cdep123"
INSERT OR IGNORE INTO users (id, matricule, nom, prenom, email, password, role)
VALUES (3, 'CDEP001', 'Département', 'Chef', 'chefdep@bea.dz',
        '$2a$10$HL0s0I8Ssc.XSH7UhNXPruVOPi5SJa1UD9b9FPWCMYWrgqzQJpEHO', 'CHEF_DEPARTEMENT');

-- Mot de passe hashé BCrypt de "pmo123"
INSERT OR IGNORE INTO users (id, matricule, nom, prenom, email, password, role)
VALUES (4, 'PMO001', 'Étude', 'Ingénieur', 'pmo@bea.dz',
        '$2a$10$wE6XtDMV5yOIRQOT/aXlFOBdlxPP/fVfkTWfHoXKNa25KXZyC6R5i', 'INGENIEUR_ETUDE_PMO');

-- Mot de passe hashé BCrypt de "dev123"
INSERT OR IGNORE INTO users (id, matricule, nom, prenom, email, password, role)
VALUES (5, 'DEV001', 'BEA', 'Développeur', 'dev@bea.dz',
        '$2a$10$eAqMQxz0eYBfO5kbBDgZ8eTfLzrm.rj8ew.W3nGBaJDPkmk0kFHEi', 'DEVELOPPEUR');

-- Mettre à jour la séquence après les inserts manuels
UPDATE users_seq SET next_val = 6;
UPDATE hibernate_sequence SET next_val = 100;

SELECT '✅ Base de données créée avec succès !' AS message;
SELECT '   Comptes : ADM001/admin123  DIR001/dir123  CDEP001/cdep123  PMO001/pmo123  DEV001/dev123' AS comptes;