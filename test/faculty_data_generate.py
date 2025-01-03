import pandas as pd
from faker import Faker
import random

fake = Faker("en_IN")

departments = [
    ("Computer Science", 20),
    ("Mathematics", 18),
    ("English", 15),
    ("Physics", 20),
    ("Chemistry", 18),
    ("Biology", 20),
    ("History", 15),
    ("Economics", 18),
    ("Psychology", 20),
]

faculty_data = []
for i in range(500):
    faculty_id = f"F{i+1:03}"
    name = fake.name()
    department, max_hours = random.choice(departments)
    faculty_data.append(
        {
            "Faculty ID": faculty_id,
            "Name": name,
            "Department": department,
            "Max Hours Per Week": max_hours,
        }
    )

df = pd.DataFrame(faculty_data)

df.to_csv("faculty_data.csv", index=False)

print("500 rows of Indian-looking sample data saved to 'faculty_data.csv'.")
