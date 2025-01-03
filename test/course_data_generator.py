import pandas as pd

# Generate a list of 250 unique subjects
subject_data = []
for i in range(1, 251):
    subject_data.append(
        {
            "Subject Code": f"SUB{i:03}",
            "Subject Name": f"Subject {i}",
            "Credits": 3 + (i % 3),  # Credits cycle between 3, 4, 5 for variety
            "Hours Per Week": 2 + (i % 3),  # Hours cycle between 2, 3, 4 for variety
        }
    )

# Create a DataFrame for the subjects
subjects_df = pd.DataFrame(subject_data)

# Save the subjects data to a CSV file
subjects_df.to_csv("subjects_data.csv", index=False)

"250 subjects have been generated and saved to 'subjects_data.csv'."
