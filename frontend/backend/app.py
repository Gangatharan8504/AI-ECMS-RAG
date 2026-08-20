import os
import re
import json
import streamlit as st
import streamlit.components.v1 as components
from dotenv import load_dotenv
from groq import Groq

from frontend.backend.auth import (
    initialize_database,
    register_user,
    login_user
)
from rag_engine import (
    extract_pdf_pages,
    create_chunks,
    create_embeddings,
    build_faiss_index,
    search_document,
    generate_answer,
    analyze_document,
    generate_document_summary,
    generate_key_topics,
    analyze_document_risks,
    translate_text
)

# ============================================================
# AUTHENTICATION
# ============================================================

initialize_database()


if "authenticated" not in st.session_state:
    st.session_state.authenticated = False


if "user" not in st.session_state:
    st.session_state.user = None


if "auth_page" not in st.session_state:
    st.session_state.auth_page = "login"
    # ============================================================
# LOGIN / REGISTER PAGE
# ============================================================

if not st.session_state.authenticated:

    st.markdown(
        """
        <style>

        .auth-container {
            max-width: 520px;
            margin: 60px auto;
            padding: 35px;
            border-radius: 18px;
            border: 1px solid #333333;
            background: #111111;
        }

        .auth-title {
            text-align: center;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .auth-subtitle {
            text-align: center;
            color: #999999;
            margin-bottom: 30px;
        }

        .college-icon {
            text-align: center;
            font-size: 55px;
            margin-bottom: 10px;
        }

        </style>
        """,
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="college-icon">🎓</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="auth-title">AI ECMS</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div class="auth-subtitle">'
        'AI-Powered College Content Intelligence'
        '</div>',
        unsafe_allow_html=True
    )

    # --------------------------------------------------------
    # LOGIN
    # --------------------------------------------------------

    if st.session_state.auth_page == "login":

        st.subheader("🔐 Login")

        email = st.text_input(
            "Email",
            placeholder="Enter your email",
            key="login_email"
        )

        password = st.text_input(
            "Password",
            type="password",
            placeholder="Enter your password",
            key="login_password"
        )

        if st.button(
            "Login",
            use_container_width=True,
            type="primary"
        ):

            if not email or not password:

                st.error(
                    "Please enter email and password."
                )

            else:

                user = login_user(
                    email,
                    password
                )

                if user:

                    st.session_state.authenticated = True
                    st.session_state.user = user

                    st.success(
                        f"Welcome back, {user['name']}!"
                    )

                    st.rerun()

                else:

                    st.error(
                        "Invalid email or password."
                    )

        st.divider()

        st.write(
            "Don't have an account?"
        )

        if st.button(
            "Create an account",
            use_container_width=True
        ):

            st.session_state.auth_page = "register"

            st.rerun()

    # --------------------------------------------------------
    # REGISTER
    # --------------------------------------------------------

    else:

        st.subheader("📝 Create Account")

        name = st.text_input(
            "Full Name",
            placeholder="Enter your full name",
            key="register_name"
        )

        email = st.text_input(
            "Email",
            placeholder="Enter your email",
            key="register_email"
        )

        role = st.selectbox(
            "Role",
            [
                "Student",
                "Faculty",
                "Admin"
            ],
            key="register_role"
        )

        password = st.text_input(
            "Password",
            type="password",
            placeholder="Minimum 6 characters",
            key="register_password"
        )

        confirm_password = st.text_input(
            "Confirm Password",
            type="password",
            placeholder="Re-enter your password",
            key="register_confirm_password"
        )

        if st.button(
            "Create Account",
            use_container_width=True,
            type="primary"
        ):

            if not name or not email or not password:

                st.error(
                    "Please fill in all required fields."
                )

            elif password != confirm_password:

                st.error(
                    "Passwords do not match."
                )

            else:

                success, message = register_user(
                    name,
                    email,
                    password,
                    role
                )

                if success:

                    st.success(
                        message
                    )

                    st.info(
                        "Your account has been created. "
                        "Please login."
                    )

                    st.session_state.auth_page = "login"

                else:

                    st.error(
                        message
                    )

        st.divider()

        st.write(
            "Already have an account?"
        )

        if st.button(
            "Back to Login",
            use_container_width=True
        ):

            st.session_state.auth_page = "login"

            st.rerun()

    st.stop()
with st.sidebar:
    st.write(
    f"👋 Welcome, **{st.session_state.user['name']}**"
)

st.caption(
    f"Role: {st.session_state.user['role']}"
)

if st.button(
    "🚪 Logout",
    use_container_width=True
):

    st.session_state.authenticated = False
    st.session_state.user = None

    st.rerun()

st.divider()
# ============================================================
# CONFIGURATION
# ============================================================
with st.sidebar:

    st.header("📂 Document Upload")
load_dotenv()

st.set_page_config(
    page_title="AI Document Intelligence",
    page_icon="📄",
    layout="wide"
)


# ============================================================
# TEXT TO SPEECH
# ============================================================

def voice_player(text, language="English"):

    if not text:
        return

    language_codes = {
        "English": "en-US",
        "Tamil": "ta-IN",
        "Hindi": "hi-IN",
        "Telugu": "te-IN",
        "Malayalam": "ml-IN",
        "Kannada": "kn-IN",
        "Bengali": "bn-IN",
        "Marathi": "mr-IN",
        "Gujarati": "gu-IN",
        "Punjabi": "pa-IN",
        "Urdu": "ur-IN",
        "French": "fr-FR",
        "German": "de-DE",
        "Spanish": "es-ES",
        "Italian": "it-IT",
        "Portuguese": "pt-PT",
        "Arabic": "ar-SA",
        "Chinese": "zh-CN",
        "Japanese": "ja-JP",
        "Korean": "ko-KR",
        "Russian": "ru-RU"
    }

    lang_code = language_codes.get(
        language,
        "en-US"
    )

    # Convert text safely for JavaScript
    safe_text = json.dumps(
        str(text)
    )

    components.html(
        f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>

        <body>

        <div style="
            display:flex;
            gap:8px;
            align-items:center;
            font-family:Arial;
        ">

            <button
                onclick="playSpeech()"
                style="
                    padding:9px 16px;
                    border:1px solid #444;
                    border-radius:8px;
                    background:#ffffff;
                    color:#111111;
                    cursor:pointer;
                    font-size:14px;
                    font-weight:500;
                "
            >
                🔊 Listen
            </button>

            <button
                onclick="stopSpeech()"
                style="
                    padding:9px 16px;
                    border:1px solid #444;
                    border-radius:8px;
                    background:#ffffff;
                    color:#111111;
                    cursor:pointer;
                    font-size:14px;
                "
            >
                ⏹ Stop
            </button>

        </div>


        <script>

        const text = {safe_text};

        const language = "{lang_code}";


        function getVoice() {{

            const voices =
                window.speechSynthesis.getVoices();

            if (!voices || voices.length === 0) {{
                return null;
            }}

            // Exact language match
            let voice = voices.find(
                v => v.lang.toLowerCase() ===
                     language.toLowerCase()
            );

            if (voice) {{
                return voice;
            }}


            // Language prefix match
            const prefix =
                language.split("-")[0].toLowerCase();

            voice = voices.find(
                v => v.lang
                    .toLowerCase()
                    .startsWith(prefix)
            );

            return voice || null;
        }}


        function playSpeech() {{

            if (!("speechSynthesis" in window)) {{

                alert(
                    "Text-to-Speech is not supported in this browser."
                );

                return;
            }}


            // Stop previous speech
            window.speechSynthesis.cancel();


            const speech =
                new SpeechSynthesisUtterance(text);


            speech.lang = language;

            speech.rate = 0.85;

            speech.pitch = 1.0;

            speech.volume = 1.0;


            const voice = getVoice();

            if (voice) {{
                speech.voice = voice;
            }}


            speech.onstart = function() {{
                console.log("Speech started");
            }};


            speech.onend = function() {{
                console.log("Speech completed");
            }};


            speech.onerror = function(event) {{
                console.log(
                    "Speech error:",
                    event.error
                );
            }};


            window.speechSynthesis.speak(
                speech
            );
        }}


        function stopSpeech() {{

            if ("speechSynthesis" in window) {{

                window.speechSynthesis.cancel();

            }}

        }}


        // Chrome sometimes loads voices asynchronously
        window.speechSynthesis.onvoiceschanged =
            function() {{

                window.speechSynthesis
                    .getVoices();

            }};

        </script>

        </body>
        </html>
        """,
        height=60
    )


# ============================================================
# LANGUAGE DETECTION
# ============================================================

def detect_document_language(text):
    """Detect the primary language using Groq only."""
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return "Unknown"

    sample = text[:12000]

    client = Groq(api_key=api_key)

    prompt = f"""
Detect the primary language of the document text below.

Return ONLY one language name.
Do not explain.
Use a common English language name such as:
English, Tamil, Hindi, Telugu, Malayalam, Kannada,
Bengali, Marathi, Gujarati, Punjabi, Urdu, French,
German, Spanish, Italian, Portuguese, Arabic, Chinese,
Japanese, Korean, Russian.

DOCUMENT TEXT:
{sample}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a precise language detector."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()


# ============================================================
# DOCUMENT DISPLAY FORMATTING
# ============================================================

def format_document_text(text):
    """
    Preserve extracted order while making obvious headings,
    bullets and numbered items easier to read.

    Note: PDF text extraction cannot perfectly reconstruct visual
    layout when the PDF itself does not contain line boundaries.
    """

    if not text:
        return ""

    # Normalize common PDF whitespace without reordering content.
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)

    # Put common all-caps section headings on separate lines.
    common_headings = [
        "CAREER OBJECTIVE",
        "EDUCATION",
        "PROJECTS",
        "INTERNSHIP",
        "EXPERIENCE",
        "TECHNICAL SKILLS",
        "SKILLS",
        "CERTIFICATIONS",
        "SOFT SKILLS",
        "LANGUAGES KNOWN",
        "ACHIEVEMENTS",
        "PUBLICATIONS",
        "REFERENCES",
        "SUMMARY",
        "INTRODUCTION",
        "CONCLUSION",
        "ABSTRACT",
        "METHODOLOGY",
        "RESULTS",
        "DISCUSSION",
        "LITERATURE REVIEW",
    ]

    for heading in common_headings:
        text = re.sub(
            rf"\s+({re.escape(heading)})\s+",
            r"\n\n\1\n\n",
            text,
            flags=re.IGNORECASE
        )

    # Preserve normal extracted line order.
    raw_lines = text.split("\n")
    output = []

    for raw in raw_lines:
        line = raw.strip()

        if not line:
            if output and output[-1] != "":
                output.append("")
            continue

        # Heading
        if (
            line.upper() == line
            and 2 <= len(line) <= 80
            and any(ch.isalpha() for ch in line)
        ):
            output.append(f"### {line}")
            continue

        # Numbered item
        if re.match(r"^\d+[\.\)]\s+", line):
            output.append(line)
            continue

        # Bullet item
        if line.startswith(("•", "▪", "‣", "–", "-")):
            output.append(line)
            continue

        output.append(line)

    # Avoid huge empty gaps.
    result = "\n\n".join(
        item for item in output if item != ""
    )

    return result


# ============================================================
# SUPPORTED TRANSLATION LANGUAGES
# ============================================================

SUPPORTED_LANGUAGES = [
    "English",
    "Tamil",
    "Hindi",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Urdu",
    "French",
    "German",
    "Spanish",
    "Italian",
    "Portuguese",
    "Arabic",
    "Chinese",
    "Japanese",
    "Korean",
    "Russian"
]


# ============================================================
# SESSION STATE
# ============================================================

defaults = {

    "pages": [],

    "chunks": [],

    "faiss_index": None,

    "chat_history": [],

    "document_name": "",

    "processed": False,

    "document_analysis": None,

    "document_summary": None,

    "key_topics": None,

    "document_risks": None,

    "detected_language": None,

    "translated_summary": None,

    "translated_language": None,

    "current_translated_answer": None,

    "current_answer_language": None
}


for key, value in defaults.items():

    if key not in st.session_state:

        st.session_state[key] = value


# ============================================================
# CUSTOM CSS
# ============================================================

st.markdown(
    """
    <style>

    .main-title {
        font-size: 38px;
        font-weight: 700;
        margin-bottom: 5px;
    }

    .subtitle {
        color: #888888;
        font-size: 17px;
        margin-bottom: 25px;
    }

    .analysis-card {
        padding: 18px;
        border-radius: 12px;
        border: 1px solid #303030;
        margin-bottom: 15px;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ============================================================
# HEADER
# ============================================================

st.markdown(
    """
    <div class="main-title">
        📄 AI-Based Enterprise Content Management System
    </div>
    """,
    unsafe_allow_html=True
)

st.markdown(
    """
    <div class="subtitle">
        Intelligent Document Processing • OCR • RAG • FAISS • Groq
    </div>
    """,
    unsafe_allow_html=True
)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.header("📂 Document Upload")

    uploaded_file = st.file_uploader(
        "Upload your PDF",
        type=["pdf"],
        help="Upload a PDF document"
    )

    st.divider()

    process_button = st.button(
        "⚡ Process Document",
        use_container_width=True,
        type="primary"
    )

    st.divider()

    st.caption("AI Pipeline")

    st.write("📄 PDF / OCR")

    st.write("✂️ Text Chunking")

    st.write("🧠 Embeddings")

    st.write("🔎 FAISS Vector Search")

    st.write("🤖 Groq LLM")

    st.divider()

    if st.session_state.processed:

        st.success(
            "✅ Document Ready"
        )

        st.caption(
            st.session_state.document_name
        )


# ============================================================
# PROCESS DOCUMENT
# ============================================================

if uploaded_file and process_button:

    # --------------------------------------------------------
    # RESET OLD DATA
    # --------------------------------------------------------

    st.session_state.pages = []

    st.session_state.chunks = []

    st.session_state.faiss_index = None

    st.session_state.chat_history = []

    st.session_state.document_analysis = None

    st.session_state.document_summary = None

    st.session_state.key_topics = None

    st.session_state.document_risks = None

    st.session_state.detected_language = None

    st.session_state.translated_summary = None

    st.session_state.translated_language = None

    st.session_state.current_translated_answer = None

    st.session_state.current_answer_language = None

    st.session_state.document_name = ""

    st.session_state.processed = False


    st.subheader(
        "⚙️ Document Processing"
    )

    progress = st.progress(0)

    status = st.empty()


    try:

        # ====================================================
        # STEP 1 - EXTRACTION
        # ====================================================

        status.info(
            "📄 Step 1/4 — Extracting text from document..."
        )

        progress.progress(20)


        pages = extract_pdf_pages(
            uploaded_file
        )


        # ----------------------------------------------------
        # OCR CHECK
        # ----------------------------------------------------

        ocr_pages = [
            page
            for page in pages
            if page.get("method") == "OCR"
        ]


        if ocr_pages:

            st.info(
                f"🔍 OCR was used on "
                f"{len(ocr_pages)} page(s)."
            )


        # ----------------------------------------------------
        # READABLE TEXT CHECK
        # ----------------------------------------------------

        readable_pages = [

            page

            for page in pages

            if page.get(
                "text",
                ""
            ).strip()

        ]


        if not readable_pages:

            st.error(
                "❌ No readable text could be extracted."
            )

            st.warning(
                "The PDF may contain unsupported "
                "image content or OCR may not be "
                "configured correctly."
            )

            st.stop()


        st.session_state.pages = pages

        # ----------------------------------------------------
        # LANGUAGE DETECTION
        # ----------------------------------------------------

        status.info(
            "🌐 Detecting document language..."
        )

        full_text = "\n".join(
            page.get("text", "")
            for page in pages
        )

        try:
            detected_language = detect_document_language(
                full_text
            )
        except Exception as language_error:
            detected_language = "Unknown"
            st.warning(
                f"Language detection failed: {language_error}"
            )

        st.session_state.detected_language = (
            detected_language
        )

        st.success(
            f"🌐 Detected language: **{detected_language}**"
        )


        # ====================================================
        # STEP 2 - CHUNKING
        # ====================================================

        status.info(
            "✂️ Step 2/4 — Splitting document into chunks..."
        )

        progress.progress(40)


        chunks = create_chunks(
            pages,
            chunk_size=500,
            overlap=50
        )


        if not chunks:

            st.error(
                "❌ Unable to create document chunks."
            )

            st.stop()


        st.session_state.chunks = chunks


        # ====================================================
        # STEP 3 - EMBEDDINGS
        # ====================================================

        status.info(
            "🧠 Step 3/4 — Generating document embeddings..."
        )

        progress.progress(65)


        embeddings = create_embeddings(
            chunks
        )


        # ====================================================
        # STEP 4 - FAISS
        # ====================================================

        status.info(
            "🔎 Step 4/4 — Building FAISS vector index..."
        )

        progress.progress(85)


        faiss_index = build_faiss_index(
            embeddings
        )


        st.session_state.faiss_index = (
            faiss_index
        )


        # ====================================================
        # BASIC ANALYSIS
        # ====================================================

        st.session_state.document_analysis = (
            analyze_document(
                pages
            )
        )


        # ====================================================
        # COMPLETE
        # ====================================================

        progress.progress(100)


        status.success(
            "✅ Document processing completed successfully!"
        )


        st.session_state.document_name = (
            uploaded_file.name
        )


        st.session_state.processed = True


        st.success(
            f"🎉 **{uploaded_file.name}** "
            f"is ready for AI analysis."
        )


    except Exception as e:

        st.error(
            "❌ Error while processing the document."
        )

        st.exception(e)


# ============================================================
# DOCUMENT ANALYSIS
# ============================================================

if st.session_state.processed:

    st.divider()

    st.header(
        "📊 Document Analysis"
    )


    analysis = (
        st.session_state.document_analysis
    )


    # ========================================================
    # STATISTICS
    # ========================================================

    col1, col2, col3, col4, col5 = st.columns(5)


    with col1:

        st.metric(
            "📄 Pages",
            analysis["page_count"]
        )


    with col2:

        st.metric(
            "📝 Words",
            f"{analysis['word_count']:,}"
        )


    with col3:

        st.metric(
            "🔹 Characters",
            f"{analysis['character_count']:,}"
        )


    with col4:

        st.metric(
            "🧩 Chunks",
            len(
                st.session_state.chunks
            )
        )

    with col5:

        st.metric(
            "🌐 Language",
            st.session_state.detected_language or "Unknown"
        )


    # ========================================================
    # AI INSIGHTS
    # ========================================================

    st.divider()

    st.subheader(
        "✨ AI Document Insights"
    )

    st.caption(
        "Analyze the complete document using Groq."
    )


    if st.button(
        "✨ Generate Complete AI Analysis",
        type="primary"
    ):

        with st.spinner(
            "🤖 AI is analyzing the document..."
        ):

            try:

                summary = (
                    generate_document_summary(
                        st.session_state.pages
                    )
                )


                topics = (
                    generate_key_topics(
                        st.session_state.pages
                    )
                )


                risks = (
                    analyze_document_risks(
                        st.session_state.pages
                    )
                )


                st.session_state.document_summary = (
                    summary
                )


                st.session_state.key_topics = (
                    topics
                )


                st.session_state.document_risks = (
                    risks
                )


                st.success(
                    "✅ AI analysis completed."
                )


            except Exception as e:

                st.error(
                    "❌ AI analysis failed."
                )

                st.exception(e)


    # ========================================================
    # AI SUMMARY
    # ========================================================

    if st.session_state.document_summary:

        st.divider()

        st.subheader(
            "📝 AI Executive Summary"
        )

        st.caption(
            "5 most important points from the document"
        )


        st.markdown(
            st.session_state.document_summary
        )


        # ----------------------------------------------------
        # SUMMARY TRANSLATION
        # ----------------------------------------------------

        st.markdown(
            "### 🌐 Translate & 🔊 Listen"
        )

        st.info(
            f"Source language detected: **{st.session_state.detected_language or 'Unknown'}**"
        )


        col1, col2 = st.columns(
            [2, 1]
        )


        with col1:

            summary_language = st.selectbox(
                "Choose language",
                SUPPORTED_LANGUAGES,
                key="summary_language"
            )


        with col2:

            st.write("")

            translate_summary_button = (
                st.button(
                    "🌐 Translate",
                    key="translate_summary",
                    use_container_width=True
                )
            )


        if translate_summary_button:

            with st.spinner(
                f"Translating to "
                f"{summary_language}..."
            ):

                try:

                    translated = (
                        translate_text(
                            st.session_state.document_summary,
                            summary_language
                        )
                    )


                    st.session_state.translated_summary = (
                        translated
                    )


                    st.session_state.translated_language = (
                        summary_language
                    )


                except Exception as e:

                    st.error(
                        f"Translation failed: {e}"
                    )


        # ----------------------------------------------------
        # TRANSLATED SUMMARY
        # ----------------------------------------------------

        if st.session_state.translated_summary:

            st.markdown(
                f"#### 🌐 "
                f"{st.session_state.translated_language}"
            )


            st.markdown(
                st.session_state.translated_summary
            )


            # IMPORTANT:
            # Real user-clicked voice button

            voice_player(
                st.session_state.translated_summary,
                st.session_state.translated_language
            )


    # ========================================================
    # KEY TOPICS
    # ========================================================

    if st.session_state.key_topics:

        st.divider()

        st.subheader(
            "🔑 Important Topics"
        )

        st.markdown(
            st.session_state.key_topics
        )


    # ========================================================
    # RISKS
    # ========================================================

    if st.session_state.document_risks:

        st.divider()

        st.subheader(
            "⚠️ Document Risks"
        )

        st.markdown(
            st.session_state.document_risks
        )


    # ========================================================
    # DOCUMENT CONTENT
    # ========================================================

    st.divider()

    st.header(
        "📖 Document Content"
    )


    page_numbers = [

        page["page_number"]

        for page in st.session_state.pages

        if page.get(
            "text",
            ""
        ).strip()

    ]


    if page_numbers:

        selected_page = st.selectbox(
            "Select page",
            page_numbers,
            key="selected_document_page"
        )


        selected_page_data = next(

            (
                page

                for page
                in st.session_state.pages

                if page["page_number"]
                == selected_page

            ),

            None

        )


        if selected_page_data:

            page_text = (
                selected_page_data["text"]
            )


            method = (
                selected_page_data.get(
                    "method",
                    "text"
                )
            )


            if method == "OCR":

                st.markdown(
                    f"### 📄 Page "
                    f"{selected_page} 🔍 OCR"
                )

            else:

                st.markdown(
                    f"### 📄 Page "
                    f"{selected_page}"
                )


            # ------------------------------------------------
            # ORIGINAL CONTENT
            # ------------------------------------------------

            st.markdown(
                "#### Original Content"
            )


            st.markdown(
                format_document_text(page_text)
            )


            # ------------------------------------------------
            # PAGE TRANSLATION
            # ------------------------------------------------

            st.markdown(
                "### 🌐 Translate This Page"
            )

            st.info(
                f"Source language detected: **{st.session_state.detected_language or 'Unknown'}**"
            )


            page_language = st.selectbox(
                "Language",
                SUPPORTED_LANGUAGES,
                key=f"page_language_{selected_page}"
            )


            if st.button(
                "🌐 Translate This Page",
                key=f"translate_page_{selected_page}"
            ):

                with st.spinner(
                    f"Translating page "
                    f"{selected_page}..."
                ):

                    try:

                        translated_page = (
                            translate_text(
                                page_text,
                                page_language
                            )
                        )


                        st.session_state[
                            f"translated_page_{selected_page}"
                        ] = translated_page


                        st.session_state[
                            f"translated_page_language_{selected_page}"
                        ] = page_language


                    except Exception as e:

                        st.error(
                            f"Translation failed: {e}"
                        )


            translated_key = (
                f"translated_page_{selected_page}"
            )


            translated_language_key = (
                f"translated_page_language_{selected_page}"
            )


            if translated_key in st.session_state:

                st.markdown(
                    f"#### 🌐 "
                    f"{st.session_state[translated_language_key]}"
                )


                st.write(
                    st.session_state[
                        translated_key
                    ]
                )


                voice_player(
                    st.session_state[
                        translated_key
                    ],
                    st.session_state[
                        translated_language_key
                    ]
                )


# ============================================================
# RAG CHATBOT
# ============================================================

st.divider()

st.header(
    "💬 Ask This Document"
)

st.caption(
    "Ask questions based only on the uploaded document."
)


# ============================================================
# CHAT HISTORY
# ============================================================

for message in (
    st.session_state.chat_history
):

    with st.chat_message(
        message["role"]
    ):

        st.markdown(
            message["content"]
        )


# ============================================================
# CHAT INPUT
# ============================================================

question = st.chat_input(
    "Ask a question about your document..."
)


if question:

    if not st.session_state.processed:

        st.warning(
            "⚠️ Please upload and process "
            "a PDF first."
        )

        st.stop()


    # --------------------------------------------------------
    # USER MESSAGE
    # --------------------------------------------------------

    st.session_state.chat_history.append(
        {
            "role": "user",
            "content": question
        }
    )


    with st.chat_message(
        "user"
    ):

        st.markdown(
            question
        )


    # --------------------------------------------------------
    # AI RESPONSE
    # --------------------------------------------------------

    with st.chat_message(
        "assistant"
    ):

        with st.spinner(
            "🔎 Searching document "
            "and generating answer..."
        ):

            try:

                retrieved_chunks = (
                    search_document(
                        question,
                        st.session_state.faiss_index,
                        st.session_state.chunks,
                        top_k=5
                    )
                )


                answer = (
                    generate_answer(
                        question,
                        retrieved_chunks
                    )
                )


                # ------------------------------------------------
                # ANSWER
                # ------------------------------------------------

                st.markdown(
                    answer
                )


                # ------------------------------------------------
                # TRANSLATION
                # ------------------------------------------------

                st.markdown(
                    "### 🌐 Translate & 🔊 Listen"
                )

                st.info(
                    f"Source language: **{st.session_state.detected_language or 'Unknown'}**"
                )


                answer_col1, answer_col2 = (
                    st.columns(
                        [2, 1]
                    )
                )


                chat_key = (
                    len(
                        st.session_state.chat_history
                    )
                )


                with answer_col1:

                    answer_language = (
                        st.selectbox(
                            "Choose language",
                            [
                                "English",
                                "Tamil",
                                "Hindi",
                                "Telugu",
                                "Malayalam",
                                "Kannada"
                            ],
                            key=f"answer_language_{chat_key}"
                        )
                    )


                with answer_col2:

                    st.write("")


                    translate_answer_button = (
                        st.button(
                            "🌐 Translate",
                            key=f"translate_answer_{chat_key}",
                            use_container_width=True
                        )
                    )


                if translate_answer_button:

                    with st.spinner(
                        f"Translating to "
                        f"{answer_language}..."
                    ):

                        try:

                            translated_answer = (
                                translate_text(
                                    answer,
                                    answer_language
                                )
                            )


                            st.session_state[
                                "current_translated_answer"
                            ] = (
                                translated_answer
                            )


                            st.session_state[
                                "current_answer_language"
                            ] = (
                                answer_language
                            )


                        except Exception as e:

                            st.error(
                                f"Translation failed: {e}"
                            )


                # ------------------------------------------------
                # SHOW TRANSLATED ANSWER
                # ------------------------------------------------

                if (
                    st.session_state
                    .current_translated_answer
                ):

                    st.markdown(
                        f"#### 🌐 "
                        f"{st.session_state.current_answer_language}"
                    )


                    st.markdown(
                        st.session_state.current_translated_answer
                    )


                    # Real user-clicked voice control
                    voice_player(
                        st.session_state.current_translated_answer,
                        st.session_state.current_answer_language
                    )


                # ------------------------------------------------
                # SOURCES
                # ------------------------------------------------

                if retrieved_chunks:

                    st.markdown(
                        "### 📚 Sources"
                    )


                    unique_pages = sorted(
                        set(
                            chunk["page_number"]
                            for chunk
                            in retrieved_chunks
                        )
                    )


                    st.write(
                        "Answer retrieved from "
                        "page(s): "
                        +
                        ", ".join(
                            str(page)
                            for page
                            in unique_pages
                        )
                    )


                    with st.expander(
                        "🔎 View retrieved "
                        "document sections"
                    ):


                        for chunk in (
                            retrieved_chunks
                        ):

                            st.markdown(
                                f"**📄 Page "
                                f"{chunk['page_number']}**"
                            )


                            st.write(
                                chunk["text"]
                            )


                            st.caption(
                                f"Similarity score: "
                                f"{chunk['score']:.3f}"
                            )


                            st.divider()


                else:

                    st.info(
                        "No relevant document "
                        "sections were retrieved."
                    )


            except Exception as e:

                answer = (
                    "❌ Unable to generate "
                    "the answer."
                )


                st.error(
                    f"Error: {e}"
                )


    # --------------------------------------------------------
    # SAVE ASSISTANT RESPONSE
    # --------------------------------------------------------

    st.session_state.chat_history.append(
        {
            "role": "assistant",
            "content": answer
        }
    )