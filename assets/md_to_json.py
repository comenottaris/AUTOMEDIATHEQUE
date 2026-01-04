import json
import glob
import os
from datetime import datetime
import yaml
from pathlib import Path

def parse_md_file(file_path):
    """Parse a single markdown file and return its metadata as a dictionary"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split front matter from content
    if '---' not in content:
        return None

    front_matter = content.split('---')[1]
    metadata = yaml.safe_load(front_matter)

    if not metadata:
        return None

    # Convert date strings to proper format
    for date_field in ['date_added', 'last_checked']:
        if date_field in metadata and metadata[date_field]:
            try:
                # Parse the date and format it as YYYY-MM-DD
                dt = datetime.strptime(metadata[date_field], '%Y-%m-%d')
                metadata[date_field] = dt.strftime('%Y-%m-%d')
            except:
                pass

    return metadata

def process_md_files(input_dir, output_file):
    """Process all markdown files in a directory and create a JSON output"""
    md_files = glob.glob(os.path.join(input_dir, '*.md'))
    automedias = []

    for file_path in md_files:
        metadata = parse_md_file(file_path)
        if metadata:
            # Create the structure matching the example
            automedia = {
                "title": metadata.get('title', ''),
                "aliases": metadata.get('aliases', []),
                "tags": metadata.get('tags', []),
                "date_added": metadata.get('date_added', ''),
                "last_checked": metadata.get('last_checked', ''),
                "url": metadata.get('url', ''),
                "type": metadata.get('type', ''),
                "language": metadata.get('language', ''),
                "country": metadata.get('country', ''),
                "platforms": metadata.get('platforms', []),
                "primary_contact": metadata.get('primary_contact', ''),
                "active": metadata.get('active', False),
                "reliability_rating": metadata.get('reliability_rating', 0),
                "opsec_risk": metadata.get('opsec_risk', ''),
                "archive_locations": metadata.get('archive_locations', []),
                "data_formats": metadata.get('data_formats', []),
                "license": metadata.get('license', ''),
                "geo_coords": metadata.get('geo_coords', ''),
                "related_collectives": metadata.get('related_collectives', []),
                "notes_short": metadata.get('notes_short', ''),
                "notes_long": metadata.get('notes_long', '')
            }
            automedias.append(automedia)

    # Sort by date_added (newest first)
    automedias.sort(key=lambda x: x['date_added'], reverse=True)

    # Create the final structure
    output_data = {
        "version": "1.0",
        "date_updated": datetime.now().strftime('%Y-%m-%d'),
        "count": len(automedias),
        "automedias": automedias
    }

    # Write to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully processed {len(automedias)} files to {output_file}")

if __name__ == "__main__":
    # Configuration
    INPUT_DIR = "./md_files"  # Directory containing your .md files
    OUTPUT_FILE = "./automedias.json"  # Output JSON file

    # Create output directory if it doesn't exist
    Path(INPUT_DIR).mkdir(parents=True, exist_ok=True)

    # Process files
    process_md_files(INPUT_DIR, OUTPUT_FILE)
