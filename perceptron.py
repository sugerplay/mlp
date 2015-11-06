import random

def random_vector(minmax):
	arr = [None]*len(minmax)
	for i in range(0, len(minmax)):
		arr[i] = minmax[i][0] + ((minmax[i][1] - minmax[i][0]) * random.random())
	return arr
	
def initialize_weights(problem_size):
	minmax = [[-1.0,1.0]]*(problem_size + 1)
	return random_vector(minmax)
	
def update_weights(num_inputs, weights, input, out_exp, out_act, l_rate):
	for i in range(0,num_inputs):
		weights[i] += l_rate * (out_exp - out_act) * input[i]
	weights[num_inputs] += l_rate * (out_exp - out_act) * 1.0

def activate(weights, vector):
	sum = weights[len(weights)-1] * 1.0
	for i in range(0, len(vector)):
		w = weights[i]
		v = vector[i]
		sum += w * v
	return sum

def transfer(activation):
	if activation >= 0:
		return 1.0
	return 0.0

def get_output(weights, vector):
	activation = activate(weights, vector)
	return transfer(activation)

def train_weights(weights, domain, num_inputs, iterations, lrate):
	for i in range(0, iterations):
		error = 0.0
		for pattern in domain:
			input = [None]*num_inputs
			for j in range(0,len(input)):
				input[j] = float(pattern[j])
			expected = int(pattern[len(pattern)-1])
			
			for k in range(0,len(weights)):
				e = 0
				if expected == k:
					e = 1
				w = weights[k]
				output = get_output(w, input)
				error += abs(output - e)
				update_weights(num_inputs, w, input, e, output, lrate)
		print("> epoch=%d, error=%f" % (i, error))
# 30: 1546
# 500: 1542

def test_weights(weights, domain, num_inputs):
	correct = 0
	for pattern in domain:
		input_vector = [None]*num_inputs
		for i in range(0,len(input_vector)):
			input_vector[i] = float(pattern[i])
		
		best = 0
		select = 0
		for i in range(0,len(weights)):
			activation = activate(weights[i], input_vector)
			if activation >= best:
				best = activation
				select = i
		answer = int(pattern[len(pattern)-1])
		print('ai: %d, anwer: %d' % (select, answer))
		if select == answer:
			correct += 1
	return correct

inputs = 64
iterations = 5
learning_rate = 0.1
weights = []

while 1:
	print('1 for Learning, 2 for Testing, quit for another')
	mode = input('>> ');

	if mode == 1:
		for i in range(0,10):
			weights.append(initialize_weights(inputs))
			
		print('Learning')
		print('input file name')
		fileName = input('>> ')
		f = open(fileName, 'r')

		if not f:
			print('file not found')
			continue;

		domain = []
		while 1:
			line = f.readline()
			if not line:
				break			
			words = line.split(',')
			domain.append(words)
# 			classifier = words[len(words)-1].replace('\n', '')
# 			print(classifier)
		train_weights(weights, domain, inputs, iterations, learning_rate)

		f.close()
	elif mode == 2:
		print('Testing')
		print('input file name')
		fileName = input('>> ')
		f = open(fileName, 'r')

		if not f:
			print('file not found')
			continue;

		domain = []
		while 1:
			line = f.readline()
			if not line:
				break			
			words = line.split(',')
			domain.append(words)
# 			classifier = words[len(words)-1].replace('\n', '')
# 			print(classifier)
		c = test_weights(weights, domain, inputs)
		
		print("result: %d / %d" % (c, len(domain)))

		f.close()
	else:
		print('quit')
		exit()
