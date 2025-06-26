#!/bin/bash

# Create temporary directory for cropped images
mkdir -p dogs_cropped

# Counter for output files
counter=0

# Process each image in the dogs folder
for img in dogs/*; do
    if [[ -f "$img" ]]; then
        # Increment counter and pad with zeros
        counter=$((counter + 1))
        temp_oriented="dogs_cropped/temp_oriented_$counter.jpg"
        output_name=$(printf "dogs_cropped/dog_%03d.jpg" $counter)
        
        echo "Processing $img -> $output_name"
        
        # First auto-orient the image based on EXIF data
        convert "$img" -auto-orient "$temp_oriented"
        
        # Get dimensions of the auto-oriented image
        width=$(identify -format "%w" "$temp_oriented")
        height=$(identify -format "%h" "$temp_oriented")
        
        # Calculate square crop size (use smaller dimension)
        if [ $width -lt $height ]; then
            size=$width
            offset_x=0
            offset_y=$(( ($height - $width) / 2 ))
        else
            size=$height
            offset_x=$(( ($width - $height) / 2 ))
            offset_y=0
        fi
        
        # Crop to square and resize to consistent size (500x500) with high quality
        convert "$temp_oriented" -crop ${size}x${size}+${offset_x}+${offset_y} -resize 500x500 -quality 100 "$output_name"
        
        # Remove temporary file
        rm "$temp_oriented"
    fi
done

# Create the GIF with higher quality
echo "Creating dogs.gif..."
# Use shorter delay (40 = 0.4 seconds) for faster animation
convert -delay 40 -loop 0 dogs_cropped/*.jpg -layers OptimizeFrame dogs.gif

echo "Done! Created dogs.gif"
echo "Cleaning up temporary files..."
rm -rf dogs_cropped

# Display GIF info
echo "GIF info:"
identify -format "Size: %wx%h, File size: %b\n" dogs.gif[0]