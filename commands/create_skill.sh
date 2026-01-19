#!/bin/bash
# Create a new skill template

SKILL_NAME=$1

if [ -z "$SKILL_NAME" ]; then
    echo "Error: Please provide a skill name."
    echo "Usage: $0 <skill_name>"
    exit 1
fi

TARGET_DIR="skills/$SKILL_NAME"

if [ -d "$TARGET_DIR" ]; then
    echo "Error: Skill '$SKILL_NAME' already exists."
    exit 1
fi

mkdir -p "$TARGET_DIR"
echo "# $SKILL_NAME" > "$TARGET_DIR/README.md"
echo "metadata: {}" > "$TARGET_DIR/skill.yaml"

echo "✅ Created new skill: $SKILL_NAME"
echo "Location: $TARGET_DIR"
