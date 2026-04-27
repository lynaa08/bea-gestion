-- ============================================================================
-- SCRIPT DE MIGRATION BDD - BEA GESTION PROJETS
-- ============================================================================
-- Ce script crée les nouvelles tables et modifie les tables existantes
-- Exécuter dans l'ordre !
-- ============================================================================

-- ============================================================================
-- 1. CRÉATION TABLE MATERIELS
-- ============================================================================
CREATE TABLE materiels (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(255),
    bureau VARCHAR(255),
    service VARCHAR(255),
    etat VARCHAR(50),
    statut VARCHAR(50),
    quantite INT DEFAULT 1,
    date_acquisition DATE,
    description VARCHAR(1000),
    projet_id BIGINT,
    CONSTRAINT fk_materiel_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE SET NULL
);

-- ============================================================================
-- 2. CRÉATION TABLE PROJET_MEMBRES (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS projet_membres (
    projet_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (projet_id, user_id),
    CONSTRAINT fk_pm_projet FOREIGN KEY (projet_id) REFERENCES projets(id) ON DELETE CASCADE,
    CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. MIGRATION DES STATUTS DE PROJETS (OPTIONNEL SI DONNÉES EXISTANTES)
-- ============================================================================
-- Si vous avez déjà des projets avec les anciens statuts, migrez-les :

-- Option 1 : Mapper les anciens vers les nouveaux
UPDATE projets SET statut = 'EN_COURS' WHERE statut = 'EN_ATTENTE';
UPDATE projets SET statut = 'CLOTURE' WHERE statut = 'TERMINE';
-- Les projets "EN_COURS" restent "EN_COURS"

-- Option 2 : Mettre tous les projets non terminés en "NON_COMMENCE"
-- UPDATE projets SET statut = 'NON_COMMENCE' WHERE statut NOT IN ('EN_COURS', 'CLOTURE');

-- ============================================================================
-- 4. VÉRIFICATIONS
-- ============================================================================
-- Vérifier que les tables ont été créées
SHOW TABLES LIKE '%materiel%';
SHOW TABLES LIKE '%projet_membres%';

-- Vérifier la structure
DESCRIBE materiels;
DESCRIBE projet_membres;

-- Compter les projets par statut
SELECT statut, COUNT(*) as nb 
FROM projets 
GROUP BY statut;

-- ============================================================================
-- 5. INDEX RECOMMANDÉS (Performances)
-- ============================================================================
CREATE INDEX idx_materiel_projet ON materiels(projet_id);
CREATE INDEX idx_materiel_etat ON materiels(etat);
CREATE INDEX idx_materiel_statut ON materiels(statut);
CREATE INDEX idx_projet_statut ON projets(statut);

-- ============================================================================
-- 6. DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================
-- Insérer quelques matériels de test
INSERT INTO materiels (nom, reference, bureau, service, etat, statut, quantite, date_acquisition, description, projet_id)
VALUES 
  ('Ordinateur portable Dell', 'Dell Latitude 5520', 'Bureau 203', 'Service Informatique', 'NEUF', 'DISPONIBLE', 1, '2024-01-15', 'PC portable pour développement', NULL),
  ('Imprimante HP', 'HP LaserJet Pro M404dn', 'Bureau 105', 'Service Administratif', 'BON_ETAT', 'EN_UTILISATION', 1, '2023-06-20', 'Imprimante laser noir et blanc', NULL),
  ('Routeur Cisco', 'Cisco RV340', 'Salle serveur', 'Service Réseau', 'BON_ETAT', 'EN_UTILISATION', 2, '2023-03-10', 'Routeur VPN dual WAN', NULL);
UPDATE materiels SET statut = 'EN_UTILISATION' WHERE statut = 'En utilisation';
UPDATE materiels SET etat = 'BON_ETAT' WHERE etat = 'Bon état';
-- Vérifier l'insertion
SELECT * FROM materiels;
ALTER TABLE materiel ADD responsable VARCHAR(150);
ALTER TABLE materiel ADD tel_responsable VARCHAR(30);
ALTER TABLE projet ADD date_creation DATE;
-- ============================================================================
-- 7. ROLLBACK (EN CAS DE PROBLÈME)
-- ============================================================================
-- Si vous devez annuler les modifications :
-- DROP TABLE IF EXISTS projet_membres;
-- DROP TABLE IF EXISTS materiels;
-- 
-- Restaurer les anciens statuts :
-- UPDATE projets SET statut = 'EN_ATTENTE' WHERE statut = 'NON_COMMENCE';
-- UPDATE projets SET statut = 'TERMINE' WHERE statut = 'CLOTURE';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================