import os
import sqlite3
import json

# Database path (compatible with /tmp on Vercel)
if os.path.exists("/tmp") and os.access("/tmp", os.W_OK):
    WORKFLOW_DB = "/tmp/workflow.db"
else:
    WORKFLOW_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "workflow.db")


def get_workflow_db():
    conn = sqlite3.connect(WORKFLOW_DB, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_workflow_db():
    conn = get_workflow_db()
    c = conn.cursor()

    # 1. Products table
    c.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        specs TEXT,
        features TEXT,
        target_audience TEXT,
        category TEXT,
        customer_feedback TEXT,
        content_objective TEXT,
        preferred_language TEXT DEFAULT 'English',
        doc_filename TEXT,
        doc_extracted_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Content Workflows table
    c.execute("""
    CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'DRAFT', 
        current_stage TEXT NOT NULL DEFAULT 'DRAFT',
        
        -- Draft Agent outputs
        draft_title TEXT,
        draft_main_content TEXT,
        draft_short_description TEXT,
        draft_social_caption TEXT,
        draft_hashtags TEXT,
        
        -- Review Agent outputs
        review_grammar_issues TEXT,
        review_quality_feedback TEXT,
        review_unsupported_statements TEXT,
        review_suggestions TEXT,
        review_revised_content TEXT,
        review_accepted_status TEXT DEFAULT 'PENDING',
        
        -- Localization Agent outputs
        localization_target_language TEXT DEFAULT 'Tamil',
        localization_translated_title TEXT,
        localization_translated_content TEXT,
        localization_translated_caption TEXT,
        
        -- Compliance Agent outputs
        compliance_status TEXT, -- PASS, WARNING, FAIL
        compliance_brand_tone_check TEXT,
        compliance_prohibited_words TEXT,
        compliance_unsupported_claims TEXT,
        compliance_regulatory_concerns TEXT,
        compliance_details TEXT,
        
        -- Human Approval outputs
        approval_status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, MODIFICATION_REQUESTED
        approved_by TEXT,
        approval_comments TEXT,
        approved_at TIMESTAMP,
        
        -- Publishing Agent outputs
        publishing_channels TEXT, -- JSON array e.g. ["Website", "LinkedIn"]
        scheduled_at TIMESTAMP,
        published_at TIMESTAMP,
        publishing_status TEXT DEFAULT 'UNPUBLISHED', -- UNPUBLISHED, SCHEDULED, PUBLISHED, FAILED
        publishing_results TEXT, -- JSON array of results per channel
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
    """)

    # 3. Compliance Rules / Brand Guidelines (Admin configured)
    c.execute("""
    CREATE TABLE IF NOT EXISTS compliance_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rule_key TEXT UNIQUE NOT NULL,
        brand_guidelines TEXT,
        company_terminology TEXT,
        restricted_words TEXT,
        required_disclaimers TEXT,
        regulatory_rules TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Default compliance rules if none exist
    c.execute("SELECT COUNT(*) FROM compliance_rules")
    if c.fetchone()[0] == 0:
        c.execute("""
        INSERT INTO compliance_rules (rule_key, brand_guidelines, company_terminology, restricted_words, required_disclaimers, regulatory_rules)
        VALUES (
            'default',
            'Professional, innovative, user-first, transparent, enterprise-ready tone.',
            'AI ECMS, Enterprise Content Intelligence, Neural Index, Smart RAG',
            'guaranteed 100%, 100% risk-free, flawless, cheat, bypass, hack, untraceable',
            'Statements regarding AI accuracy are based on standard validation benchmarks and may vary with document complexity.',
            'Ensure privacy compliance (FERPA/GDPR), avoid absolute efficacy claims without cited clinical/technical verification.'
        )
        """)

    # 4. Platform Connections table
    c.execute("""
    CREATE TABLE IF NOT EXISTS platform_connections (
        platform_id TEXT PRIMARY KEY,
        platform_name TEXT NOT NULL,
        is_connected INTEGER DEFAULT 0,
        account_name TEXT,
        credentials_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    default_platforms = [
        ("website", "Company Website", 1, "Official CMS API (Live)"),
        ("linkedin", "LinkedIn", 0, None),
        ("instagram", "Instagram", 0, None),
        ("twitter", "X / Twitter", 0, None)
    ]
    for pid, pname, is_conn, acc_name in default_platforms:
        c.execute("SELECT COUNT(*) FROM platform_connections WHERE platform_id = ?", (pid,))
        if c.fetchone()[0] == 0:
            c.execute("""
            INSERT INTO platform_connections (platform_id, platform_name, is_connected, account_name)
            VALUES (?, ?, ?, ?)
            """, (pid, pname, is_conn, acc_name))

    # 5. Agent Execution Audit Log
    c.execute("""
    CREATE TABLE IF NOT EXISTS agent_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        stage TEXT NOT NULL,
        input_data TEXT,
        output_data TEXT,
        execution_time_ms INTEGER,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()

# Initialize DB on load
init_workflow_db()
