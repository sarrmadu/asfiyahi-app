export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      annonces: {
        Row: {
          actif: boolean
          cree_le: string
          cree_par: string
          dahira_id: string
          expire_le: string | null
          id: string
          texte: string
        }
        Insert: {
          actif?: boolean
          cree_le?: string
          cree_par: string
          dahira_id: string
          expire_le?: string | null
          id?: string
          texte: string
        }
        Update: {
          actif?: boolean
          cree_le?: string
          cree_par?: string
          dahira_id?: string
          expire_le?: string | null
          id?: string
          texte?: string
        }
        Relationships: [
          {
            foreignKeyName: "annonces_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annonces_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "annonces_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      archives_photos: {
        Row: {
          annee: number | null
          cree_le: string
          dahira_id: string
          id: string
          image_url: string
          legende: string | null
          ordre: number
        }
        Insert: {
          annee?: number | null
          cree_le?: string
          dahira_id: string
          id?: string
          image_url: string
          legende?: string | null
          ordre?: number
        }
        Update: {
          annee?: number | null
          cree_le?: string
          dahira_id?: string
          id?: string
          image_url?: string
          legende?: string | null
          ordre?: number
        }
        Relationships: [
          {
            foreignKeyName: "archives_photos_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acteur_id: string | null
          action: string
          adresse_ip: unknown
          apres: Json | null
          avant: Json | null
          cree_le: string
          dahira_id: string | null
          enregistrement_id: string | null
          id: number
          table_cible: string
        }
        Insert: {
          acteur_id?: string | null
          action: string
          adresse_ip?: unknown
          apres?: Json | null
          avant?: Json | null
          cree_le?: string
          dahira_id?: string | null
          enregistrement_id?: string | null
          id?: number
          table_cible: string
        }
        Update: {
          acteur_id?: string | null
          action?: string
          adresse_ip?: unknown
          apres?: Json | null
          avant?: Json | null
          cree_le?: string
          dahira_id?: string | null
          enregistrement_id?: string | null
          id?: number
          table_cible?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_acteur_id_fkey"
            columns: ["acteur_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_acteur_id_fkey"
            columns: ["acteur_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "audit_log_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      caisses: {
        Row: {
          actif: boolean
          cree_le: string
          dahira_id: string
          description: string | null
          id: string
          nom: string
          ordre: number
          type: Database["public"]["Enums"]["type_caisse"]
        }
        Insert: {
          actif?: boolean
          cree_le?: string
          dahira_id: string
          description?: string | null
          id?: string
          nom: string
          ordre?: number
          type: Database["public"]["Enums"]["type_caisse"]
        }
        Update: {
          actif?: boolean
          cree_le?: string
          dahira_id?: string
          description?: string | null
          id?: string
          nom?: string
          ordre?: number
          type?: Database["public"]["Enums"]["type_caisse"]
        }
        Relationships: [
          {
            foreignKeyName: "caisses_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      dahiras: {
        Row: {
          annee_fondation: number | null
          cotisation_defaut: number
          couleur_accent: string
          couleur_primaire: string
          cree_le: string
          devise: string
          id: string
          logo_complet_url: string | null
          logo_marque_url: string | null
          logo_mono_url: string | null
          modifie_le: string
          nom: string
          nom_court: string
          numero_free_money: string | null
          numero_orange_money: string | null
          numero_wave: string | null
          pays: string | null
          pied_page_pdf: string | null
          politique_confidentialite: string | null
          prefixe_recu: string
          seuil_double_validation: number
          ville: string | null
        }
        Insert: {
          annee_fondation?: number | null
          cotisation_defaut?: number
          couleur_accent?: string
          couleur_primaire?: string
          cree_le?: string
          devise?: string
          id?: string
          logo_complet_url?: string | null
          logo_marque_url?: string | null
          logo_mono_url?: string | null
          modifie_le?: string
          nom: string
          nom_court: string
          numero_free_money?: string | null
          numero_orange_money?: string | null
          numero_wave?: string | null
          pays?: string | null
          pied_page_pdf?: string | null
          politique_confidentialite?: string | null
          prefixe_recu?: string
          seuil_double_validation?: number
          ville?: string | null
        }
        Update: {
          annee_fondation?: number | null
          cotisation_defaut?: number
          couleur_accent?: string
          couleur_primaire?: string
          cree_le?: string
          devise?: string
          id?: string
          logo_complet_url?: string | null
          logo_marque_url?: string | null
          logo_mono_url?: string | null
          modifie_le?: string
          nom?: string
          nom_court?: string
          numero_free_money?: string | null
          numero_orange_money?: string | null
          numero_wave?: string | null
          pays?: string | null
          pied_page_pdf?: string | null
          politique_confidentialite?: string | null
          prefixe_recu?: string
          seuil_double_validation?: number
          ville?: string | null
        }
        Relationships: []
      }
      declarations: {
        Row: {
          caisse_id: string
          commentaire: string | null
          cree_le: string
          dahira_id: string
          date_paiement: string
          ecriture_id: string | null
          id: string
          membre_id: string
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          motif_rejet: string | null
          reference_transaction: string
          statut: Database["public"]["Enums"]["statut_declaration"]
          traitee_le: string | null
          traitee_par: string | null
        }
        Insert: {
          caisse_id: string
          commentaire?: string | null
          cree_le?: string
          dahira_id: string
          date_paiement: string
          ecriture_id?: string | null
          id?: string
          membre_id: string
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          motif_rejet?: string | null
          reference_transaction: string
          statut?: Database["public"]["Enums"]["statut_declaration"]
          traitee_le?: string | null
          traitee_par?: string | null
        }
        Update: {
          caisse_id?: string
          commentaire?: string | null
          cree_le?: string
          dahira_id?: string
          date_paiement?: string
          ecriture_id?: string | null
          id?: string
          membre_id?: string
          mode?: Database["public"]["Enums"]["mode_paiement"]
          montant?: number
          motif_rejet?: string | null
          reference_transaction?: string
          statut?: Database["public"]["Enums"]["statut_declaration"]
          traitee_le?: string | null
          traitee_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declarations_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "caisses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "v_soldes_caisses"
            referencedColumns: ["caisse_id"]
          },
          {
            foreignKeyName: "declarations_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_ecriture_id_fkey"
            columns: ["ecriture_id"]
            isOneToOne: false
            referencedRelation: "ecritures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "declarations_traitee_par_fkey"
            columns: ["traitee_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_traitee_par_fkey"
            columns: ["traitee_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      demandes_sociales: {
        Row: {
          dahira_id: string
          decaissee_le: string | null
          decidee_le: string | null
          decidee_par: string | null
          description: string | null
          ecriture_id: string | null
          id: string
          instruite_le: string | null
          instruite_par: string | null
          membre_id: string
          montant_accorde: number | null
          montant_demande: number | null
          montant_propose: number | null
          motif: string
          motif_decision: string | null
          soumise_le: string
          soumise_par: string
          statut: Database["public"]["Enums"]["statut_demande_sociale"]
        }
        Insert: {
          dahira_id: string
          decaissee_le?: string | null
          decidee_le?: string | null
          decidee_par?: string | null
          description?: string | null
          ecriture_id?: string | null
          id?: string
          instruite_le?: string | null
          instruite_par?: string | null
          membre_id: string
          montant_accorde?: number | null
          montant_demande?: number | null
          montant_propose?: number | null
          motif: string
          motif_decision?: string | null
          soumise_le?: string
          soumise_par: string
          statut?: Database["public"]["Enums"]["statut_demande_sociale"]
        }
        Update: {
          dahira_id?: string
          decaissee_le?: string | null
          decidee_le?: string | null
          decidee_par?: string | null
          description?: string | null
          ecriture_id?: string | null
          id?: string
          instruite_le?: string | null
          instruite_par?: string | null
          membre_id?: string
          montant_accorde?: number | null
          montant_demande?: number | null
          montant_propose?: number | null
          motif?: string
          motif_decision?: string | null
          soumise_le?: string
          soumise_par?: string
          statut?: Database["public"]["Enums"]["statut_demande_sociale"]
        }
        Relationships: [
          {
            foreignKeyName: "demandes_sociales_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_sociales_decidee_par_fkey"
            columns: ["decidee_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_sociales_decidee_par_fkey"
            columns: ["decidee_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "demandes_sociales_ecriture_id_fkey"
            columns: ["ecriture_id"]
            isOneToOne: false
            referencedRelation: "ecritures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_sociales_instruite_par_fkey"
            columns: ["instruite_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_sociales_instruite_par_fkey"
            columns: ["instruite_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "demandes_sociales_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_sociales_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "demandes_sociales_soumise_par_fkey"
            columns: ["soumise_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demandes_sociales_soumise_par_fkey"
            columns: ["soumise_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      depenses: {
        Row: {
          beneficiaire: string
          caisse_id: string
          categorie: string | null
          cree_le: string
          cree_par: string
          dahira_id: string
          date_depense: string
          ecriture_id: string | null
          id: string
          justificatif_url: string | null
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          motif: string
          motif_rejet: string | null
          statut: Database["public"]["Enums"]["statut_depense"]
          validee_le: string | null
          validee_par: string | null
        }
        Insert: {
          beneficiaire: string
          caisse_id: string
          categorie?: string | null
          cree_le?: string
          cree_par: string
          dahira_id: string
          date_depense?: string
          ecriture_id?: string | null
          id?: string
          justificatif_url?: string | null
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          motif: string
          motif_rejet?: string | null
          statut?: Database["public"]["Enums"]["statut_depense"]
          validee_le?: string | null
          validee_par?: string | null
        }
        Update: {
          beneficiaire?: string
          caisse_id?: string
          categorie?: string | null
          cree_le?: string
          cree_par?: string
          dahira_id?: string
          date_depense?: string
          ecriture_id?: string | null
          id?: string
          justificatif_url?: string | null
          mode?: Database["public"]["Enums"]["mode_paiement"]
          montant?: number
          motif?: string
          motif_rejet?: string | null
          statut?: Database["public"]["Enums"]["statut_depense"]
          validee_le?: string | null
          validee_par?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depenses_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "caisses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "v_soldes_caisses"
            referencedColumns: ["caisse_id"]
          },
          {
            foreignKeyName: "depenses_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "depenses_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_ecriture_id_fkey"
            columns: ["ecriture_id"]
            isOneToOne: false
            referencedRelation: "ecritures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_validee_par_fkey"
            columns: ["validee_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depenses_validee_par_fkey"
            columns: ["validee_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      ecritures: {
        Row: {
          annule_ecriture_id: string | null
          caisse_id: string
          categorie: string | null
          cree_le: string
          cree_par: string
          dahira_id: string
          date_operation: string
          declaration_id: string | null
          depense_id: string | null
          id: string
          libelle: string
          membre_id: string | null
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          motif_annulation: string | null
          periode_id: string
          sens: Database["public"]["Enums"]["sens_ecriture"]
          virement_id: string | null
        }
        Insert: {
          annule_ecriture_id?: string | null
          caisse_id: string
          categorie?: string | null
          cree_le?: string
          cree_par: string
          dahira_id: string
          date_operation?: string
          declaration_id?: string | null
          depense_id?: string | null
          id?: string
          libelle: string
          membre_id?: string | null
          mode: Database["public"]["Enums"]["mode_paiement"]
          montant: number
          motif_annulation?: string | null
          periode_id: string
          sens: Database["public"]["Enums"]["sens_ecriture"]
          virement_id?: string | null
        }
        Update: {
          annule_ecriture_id?: string | null
          caisse_id?: string
          categorie?: string | null
          cree_le?: string
          cree_par?: string
          dahira_id?: string
          date_operation?: string
          declaration_id?: string | null
          depense_id?: string | null
          id?: string
          libelle?: string
          membre_id?: string | null
          mode?: Database["public"]["Enums"]["mode_paiement"]
          montant?: number
          motif_annulation?: string | null
          periode_id?: string
          sens?: Database["public"]["Enums"]["sens_ecriture"]
          virement_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecritures_annule_ecriture_id_fkey"
            columns: ["annule_ecriture_id"]
            isOneToOne: false
            referencedRelation: "ecritures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecritures_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "caisses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecritures_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "v_soldes_caisses"
            referencedColumns: ["caisse_id"]
          },
          {
            foreignKeyName: "ecritures_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecritures_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "ecritures_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecritures_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecritures_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "ecritures_periode_id_fkey"
            columns: ["periode_id"]
            isOneToOne: false
            referencedRelation: "periodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ecritures_declaration"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ecritures_depense"
            columns: ["depense_id"]
            isOneToOne: false
            referencedRelation: "depenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ecritures_virement"
            columns: ["virement_id"]
            isOneToOne: false
            referencedRelation: "virements"
            referencedColumns: ["id"]
          },
        ]
      }
      evenements: {
        Row: {
          annule: boolean
          cree_le: string
          cree_par: string
          dahira_id: string
          debut_le: string
          description: string | null
          fin_le: string | null
          id: string
          latitude: number | null
          lieu: string | null
          longitude: number | null
          pointage_ouvert: boolean
          titre: string
        }
        Insert: {
          annule?: boolean
          cree_le?: string
          cree_par: string
          dahira_id: string
          debut_le: string
          description?: string | null
          fin_le?: string | null
          id?: string
          latitude?: number | null
          lieu?: string | null
          longitude?: number | null
          pointage_ouvert?: boolean
          titre: string
        }
        Update: {
          annule?: boolean
          cree_le?: string
          cree_par?: string
          dahira_id?: string
          debut_le?: string
          description?: string | null
          fin_le?: string | null
          id?: string
          latitude?: number | null
          lieu?: string | null
          longitude?: number | null
          pointage_ouvert?: boolean
          titre?: string
        }
        Relationships: [
          {
            foreignKeyName: "evenements_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evenements_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "evenements_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      membre_roles: {
        Row: {
          attribue_le: string
          attribue_par: string | null
          dahira_id: string
          id: string
          membre_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Insert: {
          attribue_le?: string
          attribue_par?: string | null
          dahira_id: string
          id?: string
          membre_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Update: {
          attribue_le?: string
          attribue_par?: string | null
          dahira_id?: string
          id?: string
          membre_id?: string
          role?: Database["public"]["Enums"]["role_type"]
        }
        Relationships: [
          {
            foreignKeyName: "membre_roles_attribue_par_fkey"
            columns: ["attribue_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membre_roles_attribue_par_fkey"
            columns: ["attribue_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "membre_roles_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membre_roles_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membre_roles_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      membres: {
        Row: {
          cotisation_mensuelle: number | null
          cree_le: string
          cree_par: string | null
          dahira_id: string
          date_adhesion: string
          id: string
          masquer_telephone: boolean
          modifie_le: string
          nom: string
          notes: string | null
          numero_membre: string
          photo_url: string | null
          prenom: string
          section_id: string | null
          statut: Database["public"]["Enums"]["statut_membre"]
          surnom: string | null
          telephone: string | null
          telephone_secondaire: string | null
          user_id: string | null
        }
        Insert: {
          cotisation_mensuelle?: number | null
          cree_le?: string
          cree_par?: string | null
          dahira_id: string
          date_adhesion?: string
          id?: string
          masquer_telephone?: boolean
          modifie_le?: string
          nom: string
          notes?: string | null
          numero_membre: string
          photo_url?: string | null
          prenom: string
          section_id?: string | null
          statut?: Database["public"]["Enums"]["statut_membre"]
          surnom?: string | null
          telephone?: string | null
          telephone_secondaire?: string | null
          user_id?: string | null
        }
        Update: {
          cotisation_mensuelle?: number | null
          cree_le?: string
          cree_par?: string | null
          dahira_id?: string
          date_adhesion?: string
          id?: string
          masquer_telephone?: boolean
          modifie_le?: string
          nom?: string
          notes?: string | null
          numero_membre?: string
          photo_url?: string | null
          prenom?: string
          section_id?: string | null
          statut?: Database["public"]["Enums"]["statut_membre"]
          surnom?: string | null
          telephone?: string | null
          telephone_secondaire?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membres_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membres_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "membres_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membres_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      page_histoire: {
        Row: {
          contenu_brouillon: Json | null
          contenu_publie: Json | null
          dahira_id: string
          id: string
          modifie_le: string
          modifie_par: string | null
          publie_le: string | null
        }
        Insert: {
          contenu_brouillon?: Json | null
          contenu_publie?: Json | null
          dahira_id: string
          id?: string
          modifie_le?: string
          modifie_par?: string | null
          publie_le?: string | null
        }
        Update: {
          contenu_brouillon?: Json | null
          contenu_publie?: Json | null
          dahira_id?: string
          id?: string
          modifie_le?: string
          modifie_par?: string | null
          publie_le?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_histoire_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: true
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_histoire_modifie_par_fkey"
            columns: ["modifie_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_histoire_modifie_par_fkey"
            columns: ["modifie_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      participations: {
        Row: {
          evenement_id: string
          id: string
          membre_id: string
          present_prevu: boolean
          repondu_le: string
        }
        Insert: {
          evenement_id: string
          id?: string
          membre_id: string
          present_prevu?: boolean
          repondu_le?: string
        }
        Update: {
          evenement_id?: string
          id?: string
          membre_id?: string
          present_prevu?: boolean
          repondu_le?: string
        }
        Relationships: [
          {
            foreignKeyName: "participations_evenement_id_fkey"
            columns: ["evenement_id"]
            isOneToOne: false
            referencedRelation: "evenements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      periodes: {
        Row: {
          annee: number
          cloturee: boolean
          cloturee_le: string | null
          cloturee_par: string | null
          dahira_id: string
          id: string
          mois: number
        }
        Insert: {
          annee: number
          cloturee?: boolean
          cloturee_le?: string | null
          cloturee_par?: string | null
          dahira_id: string
          id?: string
          mois: number
        }
        Update: {
          annee?: number
          cloturee?: boolean
          cloturee_le?: string | null
          cloturee_par?: string | null
          dahira_id?: string
          id?: string
          mois?: number
        }
        Relationships: [
          {
            foreignKeyName: "periodes_cloturee_par_fkey"
            columns: ["cloturee_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodes_cloturee_par_fkey"
            columns: ["cloturee_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "periodes_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      presences: {
        Row: {
          client_id: string
          dahira_id: string
          evenement_id: string
          id: string
          membre_id: string
          pointe_le: string
          pointe_par: string
          saisie_manuelle: boolean
          statut: Database["public"]["Enums"]["statut_presence"]
          synchronise_le: string
        }
        Insert: {
          client_id: string
          dahira_id: string
          evenement_id: string
          id?: string
          membre_id: string
          pointe_le?: string
          pointe_par: string
          saisie_manuelle?: boolean
          statut?: Database["public"]["Enums"]["statut_presence"]
          synchronise_le?: string
        }
        Update: {
          client_id?: string
          dahira_id?: string
          evenement_id?: string
          id?: string
          membre_id?: string
          pointe_le?: string
          pointe_par?: string
          saisie_manuelle?: boolean
          statut?: Database["public"]["Enums"]["statut_presence"]
          synchronise_le?: string
        }
        Relationships: [
          {
            foreignKeyName: "presences_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presences_evenement_id_fkey"
            columns: ["evenement_id"]
            isOneToOne: false
            referencedRelation: "evenements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presences_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presences_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "presences_pointe_par_fkey"
            columns: ["pointe_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presences_pointe_par_fkey"
            columns: ["pointe_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      presidents_historiques: {
        Row: {
          annee_debut: number
          annee_fin: number | null
          dahira_id: string
          id: string
          nom_complet: string
          notes: string | null
          photo_url: string | null
        }
        Insert: {
          annee_debut: number
          annee_fin?: number | null
          dahira_id: string
          id?: string
          nom_complet: string
          notes?: string | null
          photo_url?: string | null
        }
        Update: {
          annee_debut?: number
          annee_fin?: number | null
          dahira_id?: string
          id?: string
          nom_complet?: string
          notes?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presidents_historiques_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_tokens: {
        Row: {
          cree_le: string
          dahira_id: string
          id: string
          membre_id: string
          revoque: boolean
          token_hash: string
          valide_au: string
          valide_du: string
        }
        Insert: {
          cree_le?: string
          dahira_id: string
          id?: string
          membre_id: string
          revoque?: boolean
          token_hash: string
          valide_au: string
          valide_du?: string
        }
        Update: {
          cree_le?: string
          dahira_id?: string
          id?: string
          membre_id?: string
          revoque?: boolean
          token_hash?: string
          valide_au?: string
          valide_du?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_tokens_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_tokens_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_tokens_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      rapprochements: {
        Row: {
          caisse_id: string
          commentaire: string | null
          dahira_id: string
          ecart: number | null
          id: string
          mode: Database["public"]["Enums"]["mode_paiement"]
          periode_id: string
          saisi_le: string
          saisi_par: string
          solde_constate: number
          solde_theorique: number
        }
        Insert: {
          caisse_id: string
          commentaire?: string | null
          dahira_id: string
          ecart?: number | null
          id?: string
          mode: Database["public"]["Enums"]["mode_paiement"]
          periode_id: string
          saisi_le?: string
          saisi_par: string
          solde_constate: number
          solde_theorique: number
        }
        Update: {
          caisse_id?: string
          commentaire?: string | null
          dahira_id?: string
          ecart?: number | null
          id?: string
          mode?: Database["public"]["Enums"]["mode_paiement"]
          periode_id?: string
          saisi_le?: string
          saisi_par?: string
          solde_constate?: number
          solde_theorique?: number
        }
        Relationships: [
          {
            foreignKeyName: "rapprochements_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "caisses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapprochements_caisse_id_fkey"
            columns: ["caisse_id"]
            isOneToOne: false
            referencedRelation: "v_soldes_caisses"
            referencedColumns: ["caisse_id"]
          },
          {
            foreignKeyName: "rapprochements_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapprochements_periode_id_fkey"
            columns: ["periode_id"]
            isOneToOne: false
            referencedRelation: "periodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapprochements_saisi_par_fkey"
            columns: ["saisi_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapprochements_saisi_par_fkey"
            columns: ["saisi_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      recus: {
        Row: {
          dahira_id: string
          ecriture_id: string
          genere_le: string
          id: string
          membre_id: string
          numero: string
          numero_sequence: number
          pdf_url: string | null
        }
        Insert: {
          dahira_id: string
          ecriture_id: string
          genere_le?: string
          id?: string
          membre_id: string
          numero: string
          numero_sequence: number
          pdf_url?: string | null
        }
        Update: {
          dahira_id?: string
          ecriture_id?: string
          genere_le?: string
          id?: string
          membre_id?: string
          numero?: string
          numero_sequence?: number
          pdf_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recus_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recus_ecriture_id_fkey"
            columns: ["ecriture_id"]
            isOneToOne: true
            referencedRelation: "ecritures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recus_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recus_membre_id_fkey"
            columns: ["membre_id"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
      sections: {
        Row: {
          actif: boolean
          cree_le: string
          dahira_id: string
          description: string | null
          id: string
          nom: string
          ordre: number
        }
        Insert: {
          actif?: boolean
          cree_le?: string
          dahira_id: string
          description?: string | null
          id?: string
          nom: string
          ordre?: number
        }
        Update: {
          actif?: boolean
          cree_le?: string
          dahira_id?: string
          description?: string | null
          id?: string
          nom?: string
          ordre?: number
        }
        Relationships: [
          {
            foreignKeyName: "sections_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
      virements: {
        Row: {
          caisse_dest_id: string
          caisse_source_id: string
          cree_le: string
          cree_par: string
          dahira_id: string
          date_virement: string
          id: string
          montant: number
          motif: string
          valide_par: string
        }
        Insert: {
          caisse_dest_id: string
          caisse_source_id: string
          cree_le?: string
          cree_par: string
          dahira_id: string
          date_virement?: string
          id?: string
          montant: number
          motif: string
          valide_par: string
        }
        Update: {
          caisse_dest_id?: string
          caisse_source_id?: string
          cree_le?: string
          cree_par?: string
          dahira_id?: string
          date_virement?: string
          id?: string
          montant?: number
          motif?: string
          valide_par?: string
        }
        Relationships: [
          {
            foreignKeyName: "virements_caisse_dest_id_fkey"
            columns: ["caisse_dest_id"]
            isOneToOne: false
            referencedRelation: "caisses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virements_caisse_dest_id_fkey"
            columns: ["caisse_dest_id"]
            isOneToOne: false
            referencedRelation: "v_soldes_caisses"
            referencedColumns: ["caisse_id"]
          },
          {
            foreignKeyName: "virements_caisse_source_id_fkey"
            columns: ["caisse_source_id"]
            isOneToOne: false
            referencedRelation: "caisses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virements_caisse_source_id_fkey"
            columns: ["caisse_source_id"]
            isOneToOne: false
            referencedRelation: "v_soldes_caisses"
            referencedColumns: ["caisse_id"]
          },
          {
            foreignKeyName: "virements_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virements_cree_par_fkey"
            columns: ["cree_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
          {
            foreignKeyName: "virements_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virements_valide_par_fkey"
            columns: ["valide_par"]
            isOneToOne: false
            referencedRelation: "membres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virements_valide_par_fkey"
            columns: ["valide_par"]
            isOneToOne: false
            referencedRelation: "v_situation_membres"
            referencedColumns: ["membre_id"]
          },
        ]
      }
    }
    Views: {
      v_situation_membres: {
        Row: {
          a_jour: boolean | null
          cotisation: number | null
          dahira_id: string | null
          membre_id: string | null
          mois_ecoules: number | null
          nom: string | null
          numero_membre: string | null
          prenom: string | null
          section_id: string | null
          solde_du: number | null
          statut: Database["public"]["Enums"]["statut_membre"] | null
          surnom: string | null
          total_verse: number | null
        }
        Relationships: [
          {
            foreignKeyName: "membres_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membres_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      v_soldes_caisses: {
        Row: {
          caisse_id: string | null
          dahira_id: string | null
          nom: string | null
          solde: number | null
          type: Database["public"]["Enums"]["type_caisse"] | null
        }
        Relationships: [
          {
            foreignKeyName: "caisses_dahira_id_fkey"
            columns: ["dahira_id"]
            isOneToOne: false
            referencedRelation: "dahiras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      a_role: {
        Args: { roles: Database["public"]["Enums"]["role_type"][] }
        Returns: boolean
      }
      annuler_ecriture: {
        Args: { p_ecriture_id: string; p_motif: string }
        Returns: string
      }
      dahira_courant: { Args: never; Returns: string }
      encaisser_especes: {
        Args: {
          p_caisse_id: string
          p_date?: string
          p_libelle?: string
          p_membre_id: string
          p_montant: number
        }
        Returns: {
          ecriture_id: string
          numero_recu: string
          recu_id: string
        }[]
      }
      generer_recu: { Args: { p_ecriture_id: string }; Returns: string }
      membre_courant: { Args: never; Returns: string }
      membre_texte_recherche: {
        Args: { p_nom: string; p_prenom: string; p_surnom: string }
        Returns: string
      }
      normaliser_texte: { Args: { p_texte: string }; Returns: string }
      periode_pour_date: {
        Args: { p_dahira_id: string; p_date: string }
        Returns: string
      }
      rechercher_membre: {
        Args: { p_limite?: number; p_terme: string }
        Returns: {
          cotisation: number
          membre_id: string
          nom_affiche: string
          numero_membre: string
          score: number
          section: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
      valider_declaration: {
        Args: { p_declaration_id: string }
        Returns: string
      }
    }
    Enums: {
      mode_paiement:
        | "especes"
        | "wave"
        | "orange_money"
        | "free_money"
        | "virement"
        | "autre"
      role_type:
        | "president"
        | "tresorier"
        | "secretaire"
        | "commissaire"
        | "membre"
      sens_ecriture:
        | "recette"
        | "depense"
        | "virement_sortant"
        | "virement_entrant"
      statut_declaration: "en_attente" | "validee" | "rejetee"
      statut_demande_sociale:
        | "soumise"
        | "en_instruction"
        | "accordee"
        | "refusee"
        | "decaissee"
        | "cloturee"
      statut_depense: "en_attente_validation" | "validee" | "rejetee"
      statut_membre: "actif" | "inactif" | "dispense"
      statut_presence: "present" | "excuse"
      type_caisse: "mensualites" | "sociale" | "projets"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      mode_paiement: [
        "especes",
        "wave",
        "orange_money",
        "free_money",
        "virement",
        "autre",
      ],
      role_type: [
        "president",
        "tresorier",
        "secretaire",
        "commissaire",
        "membre",
      ],
      sens_ecriture: [
        "recette",
        "depense",
        "virement_sortant",
        "virement_entrant",
      ],
      statut_declaration: ["en_attente", "validee", "rejetee"],
      statut_demande_sociale: [
        "soumise",
        "en_instruction",
        "accordee",
        "refusee",
        "decaissee",
        "cloturee",
      ],
      statut_depense: ["en_attente_validation", "validee", "rejetee"],
      statut_membre: ["actif", "inactif", "dispense"],
      statut_presence: ["present", "excuse"],
      type_caisse: ["mensualites", "sociale", "projets"],
    },
  },
} as const
