import asyncio
import base64
from app.services.disease_detection import DiseaseDetectionService

async def main():
    ds = DiseaseDetectionService()
    
    img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    
    from app.services.disease_detection import DISEASE_DETECTION_PROMPT
    prompt = DISEASE_DETECTION_PROMPT
    prompt += f"\n\nCRITICAL INSTRUCTION: You MUST translate ALL output text values into the language code 'hi'. The JSON keys MUST remain exactly as provided in English, but the string values (descriptions, treatments, names) MUST be translated to 'hi'."
    
    res = await ds.ai.analyze_image(img, prompt)
    with open("ai_output.txt", "w", encoding="utf-8") as f:
        f.write(res)
    
    parsed = ds._parse_disease_response(res)
    import json
    with open("ai_parsed.json", "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    asyncio.run(main())
