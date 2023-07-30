import pandas as pd

# Load the data again
data = pd.read_csv('petfinder_data_modified.csv')

# Define the size multipliers for the specified species
size_multipliers = {
    'Dog': 7,
    'Cat': 3,
    'Rabbit': 2,
    'Guinea Pig': 1,
    'Gerbil': 1,
    'Ferret': 2,
    'Rat': 1,
    'Hamster': 1,
    'Chinchilla': 2,
    'Mouse': 1,
    'Horse': 8,
    'Miniature Horse': 5,
    'Pony': 5,
    'Donkey': 5,
    'Parakeet': 1,
    'Duck': 2,
    'Parrot': 4,
    'Dove': 2,
    'Chicken': 2,
    'Finch': 1,
    'Turtle': 2,
    'Reptile': 3,
    'Snake': 2,
    'Other Animal': 5,
    'Amphibian': 2,
    'Pig': 6,
    'Sheep': 5,
    'Goat': 5,
    'Pot Bellied': 4,
    'Alpaca': 5,
    'Cow': 5,
}

# Define a function to adjust the size values
def adjust_size(row):
    species = row['species']
    if species in size_multipliers:
        return row['size'] * size_multipliers[species]
    else:
        return row['size']

# Apply the function to the 'size' column
data['size'] = data.apply(adjust_size, axis=1)

# Display the first few rows of the modified DataFrame
data.head()

data.to_csv('petfinder_data_modified_new.csv', index=False)
